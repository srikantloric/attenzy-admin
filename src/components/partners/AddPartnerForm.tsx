import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

import { partnerSchema, type PartnerFormValues } from "@/schemas/partner.schema"
import { createPartner } from "@/api/partner"
import type { CreatePartnerResponse } from "@/types/partner"

interface AddPartnerFormProps {
    onSuccess: () => void
}

function AddPartnerForm({ onSuccess }: AddPartnerFormProps) {
    const [createdPartner, setCreatedPartner] =
        useState<CreatePartnerResponse | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError
    } = useForm<PartnerFormValues>({
        resolver: zodResolver(partnerSchema),
        defaultValues: {
            partnerName: "",
            partnerEmail: "",
            partnerCompany: "",
            partnerPhone: "",
            partnerAddress: ""
        }
    })

    const onSubmit = async (values: PartnerFormValues) => {
        try {
            const response = await createPartner(values)
            setCreatedPartner(response)
        } catch (error: any) {
            setError("root", {
                message:
                    error.response?.data?.message || "Failed to create partner"
            })
        }
    }

    /* ------------------------------- SUCCESS VIEW ------------------------------- */
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
                        <span className="text-muted-foreground">
                            Temporary Password
                        </span>
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

    /* ------------------------------- FORM VIEW --------------------------------- */
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
                <div>
                    <Label className="mb-1">Partner Name *</Label>
                    <Input
                        placeholder="Your name"
                        {...register("partnerName")} />
                    {errors.partnerName && (
                        <p className="text-sm text-destructive">
                            {errors.partnerName.message}
                        </p>
                    )}
                </div>

                <div>
                    <Label className="mb-1">Email *</Label>
                    <Input
                        placeholder="abc@gmail.com"
                        {...register("partnerEmail")} />
                    {errors.partnerEmail && (
                        <p className="text-sm text-destructive">
                            {errors.partnerEmail.message}
                        </p>
                    )}
                </div>

                <div>
                    <Label className="mb-1">Partner Company *</Label>
                    <Input
                        placeholder="Enter your company name"
                        {...register("partnerCompany")} />
                    {errors.partnerCompany && (
                        <p className="text-sm text-destructive">
                            {errors.partnerCompany.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <Label className="mb-1">Contact Number *</Label>
                    <Input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Enter 10-digit mobile number"
                        {...register("partnerPhone", {
                            onChange: (e) => {
                                e.target.value = e.target.value.replace(/\D/g, "")
                            }
                        })}
                    />
                    {errors.partnerPhone && (
                        <p className="text-sm text-destructive">
                            {errors.partnerPhone.message}
                        </p>
                    )}
                </div>


                <div>
                    <Label className="mb-1">Address *</Label>
                    <Textarea
                        placeholder="Enter your adress"
                        {...register("partnerAddress")} />
                    {errors.partnerAddress && (
                        <p className="text-sm text-destructive">
                            {errors.partnerAddress.message}
                        </p>
                    )}
                </div>
            </div>

            {errors.root && (
                <p className="text-sm text-destructive">
                    {errors.root.message}
                </p>
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
