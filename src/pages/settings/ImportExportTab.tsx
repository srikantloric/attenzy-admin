import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { AlertCircle, CheckCircle2, Download, Loader2, Upload, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useAuth from '@/hooks/useAuth';
import { createUser, getSignedUploadUrl } from '@/api/users';
import { toast } from 'sonner';

const USER_TYPES = ['STUDENT', 'STAFF', 'FACULTY'] as const;
const EXPECTED_COLUMNS = [
  'userType',
  'name',
  'phone',
  'email',
  'rfidCode',
  'externalId',
  'profilePhoto',
  'dob',
  'fatherName',
  'gender',
  'bloodGroup',
  'address',
  'class',
  'section',
  'rollNumber',
  'designation',
  'department',
  'subjects',
] as const;

const BASE_REQUIRED_COLUMNS = ['userType', 'name', 'phone'] as const;

type UserType = (typeof USER_TYPES)[number];

interface ImportRow {
  userType: string;
  name: string;
  phone: string;
  email: string;
  rfidCode: string;
  externalId: string;
  profilePhoto: string;
  dob: string;
  fatherName: string;
  gender: string;
  bloodGroup: string;
  address: string;
  class: string;
  section: string;
  rollNumber: string;
  designation: string;
  department: string;
  subjects: string;
}

interface PreviewRow extends ImportRow {
  rowNumber: number;
  isValid: boolean;
  errors: string[];
  photoPreviewUrl?: string;
  resolvedProfilePhotoFile?: File;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

interface ImportProgress {
  total: number;
  completed: number;
  currentRow?: number;
  currentName?: string;
  status: string;
}

interface PreviewState {
  fileName: string;
  folderName: string;
  headers: string[];
  missingColumns: string[];
  extraColumns: string[];
  rows: PreviewRow[];
}

const TEMPLATE_DATA = {
  STUDENT: {
    userType: 'STUDENT',
    name: 'John Doe',
    phone: '9876543210',
    email: 'john@school.edu',
    rfidCode: 'RF001',
    externalId: 'EXT001',
    profilePhoto: 'people-images/john-doe.jpg',
    dob: '2010-01-01',
    fatherName: 'Robert Doe',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: '123 School Street',
    class: 'IX-A',
    section: 'A',
    rollNumber: '',
    designation: '',
    department: '',
    subjects: '',
  },
  STAFF: {
    userType: 'STAFF',
    name: 'Jane Smith',
    phone: '9876543211',
    email: 'jane@school.edu',
    rfidCode: 'RF002',
    externalId: 'EXT002',
    profilePhoto: 'people-images/jane-smith.jpg',
    dob: '',
    fatherName: '',
    gender: '',
    bloodGroup: '',
    address: '456 Admin Avenue',
    class: '',
    section: '',
    rollNumber: '',
    designation: 'Clerk',
    department: 'Admin',
    subjects: '',
  },
  FACULTY: {
    userType: 'FACULTY',
    name: 'Dr. Brown',
    phone: '9876543212',
    email: 'brown@school.edu',
    rfidCode: 'RF003',
    externalId: 'EXT003',
    profilePhoto: 'people-images/dr-brown.jpg',
    dob: '',
    fatherName: '',
    gender: '',
    bloodGroup: '',
    address: '789 Science Road',
    class: '',
    section: '',
    rollNumber: '',
    designation: '',
    department: 'Science',
    subjects: 'Physics, Chemistry',
  },
} as const;

function ImportExportTab() {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const auth = useAuth();
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState<ImportProgress | null>(null);

  useEffect(() => {
    return () => {
      preview?.rows.forEach((row) => {
        if (row.photoPreviewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(row.photoPreviewUrl);
        }
      });
    };
  }, [preview]);

  const normalizeCell = (value: unknown) => String(value ?? '').trim();

  const convertExcelDateToISO = (value: string): string => {
    if (!value) return '';
    const num = Number(value);
    if (isNaN(num)) return value;
    if (num < 0 || num > 100000) return value;
    
    const excelEpoch = new Date(1900, 0, 1);
    const daysOffset = Math.floor(num);
    const date = new Date(excelEpoch.getTime() + daysOffset * 86400000);
    
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const normalizePath = (value: string) => value.replace(/\\/g, '/').replace(/^\.?\//, '').toLowerCase();

  const getRequiredColumnsForUserTypes = (userTypes: Set<UserType>) => {
    const requiredColumns = new Set<string>(BASE_REQUIRED_COLUMNS);

    for (const userType of userTypes) {
      for (const field of REQUIRED_COLUMNS_BY_USER_TYPE[userType]) {
        requiredColumns.add(field);
      }
    }

    requiredColumns.add('profilePhoto');

    return requiredColumns;
  };

  const REQUIRED_COLUMNS_BY_USER_TYPE: Record<UserType, Array<(typeof EXPECTED_COLUMNS)[number]>> = {
    STUDENT: ['class', 'section'],
    STAFF: ['designation', 'department'],
    FACULTY: ['department', 'subjects'],
  };

  const getFolderNameFromFile = (file: File) => {
    const path = file.webkitRelativePath || file.name;
    const normalizedPath = normalizePath(path);
    const parts = normalizedPath.split('/').filter(Boolean);
    return parts.length > 1 ? parts[0] : 'Selected folder';
  };

  const buildFileLookup = (files: File[]) => {
    const fileLookup = new Map<string, File>();

    for (const file of files) {
      const keys = new Set<string>();
      const path = normalizePath(file.webkitRelativePath || file.name);
      const pathParts = path.split('/').filter(Boolean);

      keys.add(path);
      keys.add(normalizePath(file.name));

      for (let index = 0; index < pathParts.length; index += 1) {
        keys.add(pathParts.slice(index).join('/'));
      }

      for (const key of keys) {
        if (key) {
          fileLookup.set(key, file);
        }
      }
    }

    return fileLookup;
  };

  const resolveLocalPhotoFile = (photoPath: string, fileLookup: Map<string, File>) => {
    const normalizedPhotoPath = normalizePath(photoPath);
    return fileLookup.get(normalizedPhotoPath) || fileLookup.get(normalizePath(photoPath.split('/').pop() || ''));
  };

  const downloadTemplate = () => {
    try {
      const workbook = XLSX.utils.book_new();

      Object.entries(TEMPLATE_DATA).forEach(([sheetName, data]) => {
        const worksheet = XLSX.utils.json_to_sheet([data], {
          header: EXPECTED_COLUMNS as unknown as string[],
        });
        worksheet['!cols'] = EXPECTED_COLUMNS.map(() => ({ wch: 18 }));
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      const instructions = XLSX.utils.json_to_sheet([
        { Field: 'userType', Required: 'Yes', Values: 'STUDENT | STAFF | FACULTY', Notes: 'User category' },
        { Field: 'name', Required: 'Yes', Values: 'Text', Notes: 'User full name' },
        { Field: 'phone', Required: 'Yes', Values: '10 digits', Notes: 'Numeric phone number' },
        { Field: 'email', Required: 'No', Values: 'Valid email', Notes: 'Optional contact email' },
        { Field: 'rfidCode', Required: 'No', Values: 'Text', Notes: 'Optional RFID card code' },
        { Field: 'externalId', Required: 'No', Values: 'Text', Notes: 'Optional external reference' },
        { Field: 'profilePhoto', Required: 'No', Values: 'HTTP URL or people-images/<file-name>', Notes: 'Local images must exist in the people-images folder beside the Excel file' },
        { Field: 'dob', Required: 'No', Values: 'YYYY-MM-DD', Notes: 'Optional date of birth' },
        { Field: 'fatherName', Required: 'No', Values: 'Text', Notes: 'Optional parent or guardian name' },
        { Field: 'gender', Required: 'No', Values: 'MALE | FEMALE | OTHER', Notes: 'Optional gender value' },
        { Field: 'bloodGroup', Required: 'No', Values: 'A+ | A- | B+ | B- | O+ | O- | AB+ | AB-', Notes: 'Optional blood group' },
        { Field: 'address', Required: 'No', Values: 'Text', Notes: 'Optional home or contact address' },
        { Field: 'class', Required: 'STUDENT only', Values: 'Text', Notes: 'Student class' },
        { Field: 'section', Required: 'STUDENT only', Values: 'Text', Notes: 'Student section' },
        { Field: 'rollNumber', Required: 'No', Values: 'Text', Notes: 'Optional student roll number' },
        { Field: 'designation', Required: 'STAFF only', Values: 'Text', Notes: 'Staff designation' },
        { Field: 'department', Required: 'STAFF/FACULTY', Values: 'Text', Notes: 'Department name' },
        { Field: 'subjects', Required: 'FACULTY only', Values: 'Comma-separated text', Notes: 'Faculty subjects' },
      ]);

      instructions['!cols'] = [{ wch: 18 }, { wch: 16 }, { wch: 28 }, { wch: 44 }];
      XLSX.utils.book_append_sheet(workbook, instructions, 'Instructions');
      XLSX.writeFile(workbook, 'user-import-template.xlsx');
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download template');
      console.error(error);
    }
  };

  const getPreviewValue = (row: ImportRow, key: keyof ImportRow) => {
    const value = normalizeCell(row[key]);
    if (key === 'dob') {
      return convertExcelDateToISO(value);
    }
    return value;
  };

  const validateRow = (row: ImportRow, rowNumber: number, fileLookup: Map<string, File>): PreviewRow => {
    const errors: string[] = [];
    const userType = normalizeCell(row.userType).toUpperCase() as UserType;
    const previewRow: ImportRow = {
      ...row,
      userType,
    };

    if (!USER_TYPES.includes(userType)) {
      errors.push(`Invalid userType: ${row.userType}`);
    }

    if (!normalizeCell(row.name)) {
      errors.push('Name is required');
    }

    const phone = normalizeCell(row.phone);
    if (!/^\d{10}$/.test(phone)) {
      errors.push('Phone must be exactly 10 digits');
    }

    const email = normalizeCell(row.email);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Email must be valid if provided');
    }

    if (userType === 'STUDENT') {
      if (!normalizeCell(row.class)) errors.push('Class is required for STUDENT');
      if (!normalizeCell(row.section)) errors.push('Section is required for STUDENT');
    }

    if (userType === 'STAFF') {
      if (!normalizeCell(row.designation)) errors.push('Designation is required for STAFF');
      if (!normalizeCell(row.department)) errors.push('Department is required for STAFF');
    }

    if (userType === 'FACULTY') {
      if (!normalizeCell(row.department)) errors.push('Department is required for FACULTY');
      if (!normalizeCell(row.subjects)) errors.push('Subjects are required for FACULTY');
    }

    const profilePhoto = normalizeCell(row.profilePhoto);
    let resolvedProfilePhotoFile: File | undefined;
    let photoPreviewUrl: string | undefined;

    if (profilePhoto) {
      if (/^https?:\/\//i.test(profilePhoto) || /^data:/i.test(profilePhoto)) {
        photoPreviewUrl = profilePhoto;
      } else {
        resolvedProfilePhotoFile = resolveLocalPhotoFile(profilePhoto, fileLookup);
        if (!resolvedProfilePhotoFile) {
          errors.push(`Local image not found for ${profilePhoto}`);
        } else {
          photoPreviewUrl = URL.createObjectURL(resolvedProfilePhotoFile);
        }
      }
    }

    return {
      ...previewRow,
      phone,
      email,
      profilePhoto,
      externalId: normalizeCell(row.externalId),
      fatherName: normalizeCell(row.fatherName),
      dob: convertExcelDateToISO(normalizeCell(row.dob)),
      gender: normalizeCell(row.gender),
      bloodGroup: normalizeCell(row.bloodGroup),
      address: normalizeCell(row.address),
      class: normalizeCell(row.class),
      section: normalizeCell(row.section),
      rollNumber: normalizeCell(row.rollNumber),
      designation: normalizeCell(row.designation),
      department: normalizeCell(row.department),
      subjects: normalizeCell(row.subjects),
      rowNumber,
      isValid: errors.length === 0,
      errors,
      photoPreviewUrl,
      resolvedProfilePhotoFile,
    };
  };

  const parseFileForPreview = async (files: File[]) => {
    if (!auth.user?.orgId) {
      toast.error('Organization context is missing');
      return;
    }

    const workbookFile = files.find((file) => /\.(xlsx|xls)$/i.test(file.name));

    if (!workbookFile) {
      toast.error('No Excel file was found in the selected folder');
      return;
    }

    setIsParsing(true);
    setImportResults(null);
    setUploadProgress(null);

    try {
      const workbook = XLSX.read(await workbookFile.arrayBuffer(), { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!worksheet) {
        throw new Error('No worksheet found in the file');
      }

      const fileLookup = buildFileLookup(files);
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: '' });
      const headers = ((matrix[0] ?? []) as unknown[]).map(normalizeCell).filter(Boolean);
      const dataRows = matrix
        .slice(1)
        .filter((row) => Array.isArray(row) && row.some((cell) => normalizeCell(cell) !== ''));

      const userTypesInFile = new Set<UserType>();
      for (const row of dataRows) {
        const userType = normalizeCell(row[0]).toUpperCase() as UserType;
        if (USER_TYPES.includes(userType)) {
          userTypesInFile.add(userType);
        }
      }

      const requiredColumns = getRequiredColumnsForUserTypes(userTypesInFile.size > 0 ? userTypesInFile : new Set(USER_TYPES));
      const missingColumns = Array.from(requiredColumns).filter((column) => !headers.includes(column));
      const extraColumns = headers.filter((column) => !EXPECTED_COLUMNS.includes(column as (typeof EXPECTED_COLUMNS)[number]));

      const rows = dataRows.map((values, index) => {
          const rawRow = headers.reduce<ImportRow>((accumulator, header, columnIndex) => {
            accumulator[header as keyof ImportRow] = normalizeCell(values[columnIndex]) as never;
            return accumulator;
          }, {
            userType: '',
            name: '',
            phone: '',
            email: '',
            rfidCode: '',
            externalId: '',
            profilePhoto: '',
            dob: '',
            fatherName: '',
            gender: '',
            bloodGroup: '',
            address: '',
            class: '',
            section: '',
            rollNumber: '',
            designation: '',
            department: '',
            subjects: '',
          });

          return validateRow(rawRow, index + 2, fileLookup);
        });

      setPreview({
        fileName: workbookFile.name,
        folderName: getFolderNameFromFile(workbookFile),
        headers,
        missingColumns,
        extraColumns,
        rows,
      });

      if (missingColumns.length > 0) {
        toast.warning(`Preview loaded, but missing columns were detected: ${missingColumns.join(', ')}`);
      } else {
        toast.success(`Preview loaded for ${rows.length} row${rows.length === 1 ? '' : 's'}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to read Excel file');
    } finally {
      setIsParsing(false);
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    }
  };

  const handleFolderChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    await parseFileForPreview(files);
  };

  const downloadImage = async (photoPath: string) => {
    const response = await fetch(photoPath, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    return response.blob();
  };

  const uploadFileToS3 = async (file: Blob, fileName: string) => {
    const contentType = file.type || 'image/jpeg';
    const signedUrl = await getSignedUploadUrl(fileName, contentType, file.size) as {
      uploadUrl: string;
      publicUrl?: string;
      fileUrl?: string;
    };

    const response = await fetch(signedUrl.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to S3');
    }

    return {
      url: signedUrl.publicUrl || signedUrl.fileUrl || '',
      fileKey: fileName,
    };
  };

  const deleteFileFromS3 = async (fileKey: string) => {
    try {
      const response = await fetch(
        `https://de2bhobqpg.execute-api.ap-south-1.amazonaws.com/v1/uploads/deleteS3File`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileKey }),
        }
      );
      if (!response.ok) {
        console.warn(`Failed to delete S3 file ${fileKey}`);
      }
    } catch (error) {
      console.warn(`Error deleting S3 file ${fileKey}:`, error);
    }
  };

  const processProfilePhoto = async (photo: string | File | undefined) => {
    if (!photo) {
      return undefined;
    }

    const blob = photo instanceof File ? photo : await downloadImage(photo);
    const extension = blob.type.includes('png')
      ? '.png'
      : blob.type.includes('webp')
        ? '.webp'
        : blob.type.includes('gif')
          ? '.gif'
          : '.jpg';
    const fileName = `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
    const uploadResult = await uploadFileToS3(blob, fileName);

    if (!uploadResult.url) {
      throw new Error('Signed upload response did not include a public URL');
    }

    return {
      url: uploadResult.url,
      fileKey: uploadResult.fileKey,
    };
  };

  const buildPayloadFromRow = async (row: PreviewRow) => {
    let photoData = undefined;
    if (row.resolvedProfilePhotoFile || row.profilePhoto) {
      photoData = await processProfilePhoto(row.resolvedProfilePhotoFile || row.profilePhoto);
    }

    const payload: any = {
      userType: row.userType,
      name: row.name,
      phone: row.phone,
      email: row.email,
      rfidCode: row.rfidCode || undefined,
      externalId: row.externalId || undefined,
      profilePhoto: photoData?.url,
      dob: row.dob || undefined,
      fatherName: row.fatherName || undefined,
      gender: row.gender || undefined,
      bloodGroup: row.bloodGroup || undefined,
      address: row.address || undefined,
    };

    if (row.userType === 'STUDENT') {
      payload.profile = {
        class: row.class,
        section: row.section,
        rollNumber: row.rollNumber,
      };
    }

    if (row.userType === 'STAFF') {
      payload.profile = {
        designation: row.designation,
        department: row.department,
      };
    }

    if (row.userType === 'FACULTY') {
      payload.profile = {
        department: row.department,
        subjects: row.subjects,
      };
    }

    return {
      payload,
      photoFileKey: photoData?.fileKey,
    };
  };

  const handleUpload = async () => {
    if (!auth.user?.orgId || !preview) {
      return;
    }

    const validRows = preview.rows.filter((row) => row.isValid);

    if (preview.missingColumns.length > 0) {
      toast.error('Please fix the missing columns before uploading');
      return;
    }

    if (validRows.length === 0) {
      toast.error('No valid rows found to upload');
      return;
    }

    setIsUploading(true);
    setImportResults(null);
    setUploadProgress({
      total: preview.rows.length,
      completed: 0,
      status: 'Preparing import...',
    });

    const results: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    try {
      for (const row of preview.rows) {
        const rowLabel = row.name || `row ${row.rowNumber}`;

        if (!row.isValid) {
          results.failed += 1;
          results.errors.push({
            row: row.rowNumber,
            error: row.errors.join(', '),
          });

          setUploadProgress((current) => ({
            total: current?.total ?? preview.rows.length,
            completed: (current?.completed ?? 0) + 1,
            currentRow: row.rowNumber,
            currentName: rowLabel,
            status: `Skipped invalid ${rowLabel}`,
          }));

          continue;
        }

        setUploadProgress((current) => ({
          total: current?.total ?? preview.rows.length,
          completed: current?.completed ?? 0,
          currentRow: row.rowNumber,
          currentName: rowLabel,
          status: `Creating ${rowLabel}`,
        }));

        let photoFileKey: string | undefined;
        try {
          const { payload, photoFileKey: key } = await buildPayloadFromRow(row);
          photoFileKey = key;
          await createUser(auth.user.orgId, payload);
          results.success += 1;
        } catch (error) {
          if (photoFileKey) {
            await deleteFileFromS3(photoFileKey);
          }
          results.failed += 1;
          results.errors.push({
            row: row.rowNumber,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        setUploadProgress((current) => ({
          total: current?.total ?? preview.rows.length,
          completed: (current?.completed ?? 0) + 1,
          currentRow: row.rowNumber,
          currentName: rowLabel,
          status: `Processed ${rowLabel}`,
        }));
      }

      setUploadProgress({
        total: preview.rows.length,
        completed: preview.rows.length,
        currentRow: undefined,
        currentName: undefined,
        status: `Import complete: ${results.success} successful, ${results.failed} failed`,
      });
      setImportResults(results);

      if (results.failed === 0) {
        toast.success(`Uploaded ${results.success} user${results.success === 1 ? '' : 's'} successfully`);
      } else {
        toast.warning(`Uploaded ${results.success} user${results.success === 1 ? '' : 's'} with ${results.failed} issue${results.failed === 1 ? '' : 's'}`);
      }
    } catch (error) {
      setUploadProgress((current) => ({
        total: current?.total ?? preview.rows.length,
        completed: current?.completed ?? 0,
        currentRow: current?.currentRow,
        currentName: current?.currentName,
        status: 'Import stopped because of an unexpected error',
      }));
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const totalRows = preview?.rows.length ?? 0;
  const validRows = preview?.rows.filter((row) => row.isValid).length ?? 0;
  const invalidRows = preview?.rows.filter((row) => !row.isValid).length ?? 0;
  const uploadProgressPercent = uploadProgress && uploadProgress.total > 0
    ? Math.round((uploadProgress.completed / uploadProgress.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Import Template
          </CardTitle>
          <CardDescription>
            Download an Excel template with every available field and a built-in instruction sheet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Users
          </CardTitle>
          <CardDescription>
            Select the folder that contains your Excel file and the people-images folder. The preview shows resolved local images before upload.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Profile photos can be provided as URLs or as local file references like people-images/john-doe.jpg. Select the parent folder that contains both the Excel file and the people-images folder.
            </AlertDescription>
          </Alert>

          <input
            ref={folderInputRef}
            type="file"
            className="hidden"
            multiple
            // @ts-expect-error webkitdirectory is supported by Chromium-based browsers.
            webkitdirectory="true"
            onChange={handleFolderChange}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => folderInputRef.current?.click()} disabled={isParsing || isUploading} className="gap-2">
              {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {preview ? 'Choose Another Folder' : 'Select Import Folder'}
            </Button>

            <Button
              onClick={handleUpload}
              disabled={!preview || isParsing || isUploading || validRows === 0 || preview.missingColumns.length > 0}
              className="gap-2"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {isUploading && uploadProgress
                ? `Importing ${uploadProgress.completed}/${uploadProgress.total}`
                : 'Upload Valid Users'}
            </Button>

            {preview && (
              <Button
                variant="outline"
                onClick={() => {
                  setPreview(null);
                  setImportResults(null);
                }}
              >
                Clear Preview
              </Button>
            )}
          </div>

          {preview && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-sm text-slate-600">File</div>
                  <div className="mt-1 break-all font-medium text-slate-900">{preview.fileName}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-sm text-slate-600">Folder</div>
                  <div className="mt-1 break-all font-medium text-slate-900">{preview.folderName}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="text-sm text-slate-600">Rows</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">{totalRows}</div>
                </div>
                <div className="rounded-lg bg-emerald-50 p-4">
                  <div className="text-sm text-emerald-700">Valid</div>
                  <div className="mt-1 text-2xl font-semibold text-emerald-700">{validRows}</div>
                </div>
                <div className="rounded-lg bg-rose-50 p-4">
                  <div className="text-sm text-rose-700">Invalid</div>
                  <div className="mt-1 text-2xl font-semibold text-rose-700">{invalidRows}</div>
                </div>
              </div>

              {preview.missingColumns.length > 0 && (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Missing columns: {preview.missingColumns.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              {preview.extraColumns.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Extra columns ignored: {preview.extraColumns.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              {uploadProgress && (
                <div className="rounded-lg border bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div>
                      <div className="font-medium text-slate-900">{uploadProgress.status}</div>
                      <div className="mt-1 text-slate-600">
                        {uploadProgress.currentRow ? `Row ${uploadProgress.currentRow}` : 'Starting'}
                        {uploadProgress.currentName ? ` · ${uploadProgress.currentName}` : ''}
                      </div>
                    </div>
                    <div className="text-right text-sm font-medium text-slate-700">
                      {uploadProgress.completed}/{uploadProgress.total} ({uploadProgressPercent}%)
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${uploadProgressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Row</th>
                      <th className="px-3 py-2 text-left font-semibold">Status</th>
                      {EXPECTED_COLUMNS.map((column) => (
                        <th key={column} className="px-3 py-2 text-left font-semibold">
                          {column}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-left font-semibold">Photo Preview</th>
                      <th className="px-3 py-2 text-left font-semibold">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {preview.rows.map((row) => (
                      <tr key={row.rowNumber} className={row.isValid ? 'bg-white' : 'bg-rose-50/50'}>
                        <td className="px-3 py-2 font-medium">{row.rowNumber}</td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              row.isValid
                                ? 'inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700'
                                : 'inline-flex rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700'
                            }
                          >
                            {row.isValid ? 'Valid' : 'Needs Fix'}
                          </span>
                        </td>
                        {EXPECTED_COLUMNS.map((column) => (
                          <td key={column} className="px-3 py-2 align-top text-slate-700">
                            {getPreviewValue(row, column as keyof ImportRow) || '-'}
                          </td>
                        ))}
                        <td className="px-3 py-2 align-top text-slate-700">
                          {row.photoPreviewUrl ? (
                            <div className="flex flex-col gap-2">
                              <img
                                src={row.photoPreviewUrl}
                                alt={`${row.name} profile`}
                                className="h-16 w-16 rounded-md border object-cover"
                              />
                              <span className="max-w-40 break-all text-xs text-slate-500">
                                {row.resolvedProfilePhotoFile?.webkitRelativePath || row.profilePhoto}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">No image</span>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top text-rose-700">
                          {row.errors.length > 0 ? row.errors.join('; ') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {importResults && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg bg-emerald-50 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-slate-600">Successful</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">{importResults.success}</p>
                </div>
                <div className="rounded-lg bg-rose-50 p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-rose-600" />
                    <span className="text-sm font-medium text-slate-600">Failed</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-rose-700">{importResults.failed}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-medium text-slate-600">Total Issues</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-slate-700">{importResults.success + importResults.failed}</p>
                </div>
              </div>

              {importResults.errors.length > 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                  <h3 className="font-semibold text-rose-900">Upload Errors</h3>
                  <div className="mt-2 space-y-2">
                    {importResults.errors.map((error, index) => (
                      <div key={`${error.row}-${index}`} className="text-sm text-rose-800">
                        <span className="font-medium">Row {error.row}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <div>
            <h4 className="font-semibold text-slate-900">Preview First</h4>
            <p className="mt-2">
              Every import is parsed into a table preview before any upload happens. Fix validation issues in the source file before uploading.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Column Validation</h4>
            <p className="mt-2">
              The file must include the template columns. Missing columns block upload.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Profile Photos</h4>
            <p className="mt-2">
              URL images are downloaded first, then uploaded to S3. For local imports, place photos inside the people-images folder next to the Excel file and reference them in the profilePhoto column as people-images/&lt;file-name&gt;.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ImportExportTab;