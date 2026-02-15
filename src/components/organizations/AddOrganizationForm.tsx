import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  organizationSchema,
  type OrganizationFormValues,
} from "@/schemas/organization.schema"

import { toast } from "sonner"
import { createOrganization } from "@/api/organization"
import useAuth from "@/hooks/useAuth"

interface AddOrganizationFormProps {
  onSuccess: () => void
}

function AddOrganizationForm({ onSuccess }: AddOrganizationFormProps) {
  const [isSuccess, setIsSuccess] = useState(false)

  // ✅ get logged-in user from auth context
  const { user } = useAuth()
  const partnerId = user?.partnerId

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      orgName: "",
      orgEmail: "",
      orgPhone: "",
      orgAddress: "",
    },
  })

  const onSubmit = async (data: OrganizationFormValues) => {
    if (!partnerId) return

    try {
      await createOrganization(partnerId, {
        orgName: data.orgName,
        orgEmail: data.orgEmail,
        orgPhone: data.orgPhone,
        orgAddress: data.orgAddress,
      })

      toast.success("Organization added successfully")

      reset()
      setIsSuccess(true)
      onSuccess()
    } catch (error: any) {
      console.error("Failed to add organization", error)

      toast.error(
        error?.message || "Failed to add organization. Please try again."
      )
    }
  }

  if (!partnerId) {
    return (
      <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
        Partner information not available. Please login again.
      </div>
    )
  }


  if (isSuccess) {
    return (
      <div className="space-y-4 rounded-lg border bg-muted/40 p-6 text-center">
        <h3 className="text-lg font-semibold text-green-600">
          ✅ Organization added successfully
        </h3>

        <Separator />

        <p className="text-sm text-muted-foreground">
          The organization has been created and linked to this partner.
        </p>

        <div className="flex justify-center pt-2">
          <Button onClick={onSuccess}>Close</Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Organization Name */}
      <div className="space-y-1.5">
        <Label>Organization Name *</Label>
        <Input
          className="h-11"
          placeholder="e.g. Wave International School"
          {...register("orgName")}
        />
        {errors.orgName && (
          <p className="text-sm text-destructive">
            {errors.orgName.message}
          </p>
        )}
      </div>

      {/* Organization Email */}
      <div className="space-y-1.5">
        <Label>Organization Email *</Label>
        <Input
          className="h-11"
          type="email"
          placeholder="admin@organization.com"
          {...register("orgEmail")}
        />
        {errors.orgEmail && (
          <p className="text-sm text-destructive">
            {errors.orgEmail.message}
          </p>
        )}
      </div>

      {/* Organization Phone */}
      <div className="space-y-1.5">
        <Label>Organization Phone *</Label>
        <Input
          className="h-11"
          placeholder="9931085816"
          maxLength={10}
          inputMode="numeric"
          {...register("orgPhone")}
        />
        {errors.orgPhone && (
          <p className="text-sm text-destructive">
            {errors.orgPhone.message}
          </p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label>Address *</Label>
        <Textarea
          className="min-h-[90px]"
          placeholder="Full address"
          {...register("orgAddress")}
        />
        {errors.orgAddress && (
          <p className="text-sm text-destructive">
            {errors.orgAddress.message}
          </p>
        )}
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button className="bg-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Organization"}
        </Button>
      </div>
    </form>
  )
}

export default AddOrganizationForm
