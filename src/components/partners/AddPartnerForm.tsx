import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

import { useFormik } from "formik"
import { toFormikValidationSchema } from "zod-formik-adapter"

import { partnerSchema, type PartnerFormValues } from "@/schemas/partner.schema"
import { createPartner } from "@/api/partner"
import type { CreatePartnerResponse } from "@/types/partner"

interface AddPartnerFormProps {
    onSuccess: () => void
}

function AddPartnerForm({ onSuccess }: AddPartnerFormProps) {
    const [createdPartner, setCreatedPartner] =
        useState<CreatePartnerResponse | null>(null)

    const formik = useFormik<PartnerFormValues>({
        initialValues: {
            partnerName: "",
            partnerEmail: "",
            partnerCompany: "",
            partnerPhone: "",
            partnerAddress: ""
        },
        validationSchema: toFormikValidationSchema(partnerSchema),
        onSubmit: async (values, { setSubmitting, setStatus }) => {
            try {
                const response = await createPartner(values)

                // ✅ response matches backend shape
                setCreatedPartner(response)
            } catch (error: any) {
                setStatus(
                    error.response?.data?.message || "Failed to create partner"
                )
            } finally {
                setSubmitting(false)
            }
        }
    })


/* -------------------------------- SUCCESS VIEW ------------------------------- */
if (createdPartner) {
  return (
    <div className="space-y-6 rounded-lg border bg-muted/40 p-6">
      <h3 className="text-lg font-semibold text-green-600">
        ✅ Partner Created Successfully
      </h3>

      <Separator />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Partner ID</span>
          <span className="font-mono break-all text-right">
            {createdPartner.partnerId}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Username</span>
          <span className="font-mono break-all text-right">
            {createdPartner.credentials.username}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Temporary Password</span>
          <span className="font-mono text-destructive break-all text-right">
            {createdPartner.credentials.password}
          </span>
        </div>
      </div>

      <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-700">
        ⚠️ Please copy and share these credentials securely.
        You can change your password after first login.
      </div>

      <div className="flex justify-end">
        <Button onClick={onSuccess}>Done</Button>
      </div>
    </div>
  )
}

/* -------------------------------- FORM VIEW ------------------------------- */
const {
    values,
    errors,
    touched,
    status,
    isSubmitting,
    handleChange,
    handleSubmit
} = formik

return (
    <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div className="space-y-6">
            <div>
                <Label className="mb-1">Partner Name *</Label>
                <Input
                    type="text"
                    name="partnerName"
                    value={values.partnerName}
                    onChange={handleChange}
                />
                {touched.partnerName && errors.partnerName && (
                    <p className="text-sm text-destructive">{errors.partnerName}</p>
                )}
            </div>

            <div>
                <Label className="mb-1">Email *</Label>
                <Input
                    type="email"
                    name="partnerEmail"
                    value={values.partnerEmail}
                    onChange={handleChange}
                />
                {touched.partnerEmail && errors.partnerEmail && (
                    <p className="text-sm text-destructive">{errors.partnerEmail}</p>
                )}
            </div>

            <div>
                <Label className="mb-1">Partner Company *</Label>
                <Input
                    type="text"
                    name="partnerCompany"
                    value={values.partnerCompany}
                    onChange={handleChange}
                />
                {touched.partnerCompany && errors.partnerCompany && (
                    <p className="text-sm text-destructive">
                        {errors.partnerCompany}
                    </p>
                )}
            </div>
        </div>

        {/* Contact */}
        <div className="space-y-4">
            <div>
                <Label className="mb-1">Contact Number *</Label>
                <Input
                    type="number"
                    name="partnerPhone"
                    value={values.partnerPhone}
                    onChange={handleChange}
                />
                {touched.partnerPhone && errors.partnerPhone && (
                    <p className="text-sm text-destructive">{errors.partnerPhone}</p>
                )}
            </div>

            <div>
                <Label className="mb-1">Address *</Label>
                <Textarea
                    name="partnerAddress"
                    value={values.partnerAddress}
                    onChange={handleChange}
                />
                {touched.partnerAddress && errors.partnerAddress && (
                    <p className="text-sm text-destructive">
                        {errors.partnerAddress}
                    </p>
                )}
            </div>
        </div>

        {status && (
            <p className="text-sm text-destructive">{status}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onSuccess}>
                Cancel
            </Button>
            <Button className="bg-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Partner"}
            </Button>
        </div>
    </form>
)
}

export default AddPartnerForm
