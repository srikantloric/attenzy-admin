//shadcn-import
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import AuthWrapper from "@/sections/auth/AuthWrapper"

function Login() {
    return (
        <AuthWrapper>
            <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm md:max-w-4xl">
                    <div className={"flex flex-col gap-6"}>
                        <Card className="overflow-hidden p-0">
                            <CardContent className="grid p-0 md:grid-cols-2">
                                <form className="p-6 md:p-8">
                                    <FieldGroup>
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <h1 className="text-2xl font-bold">Welcome back</h1>
                                            <p className="text-muted-foreground text-balance">
                                                Login to your Attenzy IOT account
                                            </p>
                                        </div>
                                        <Field>
                                            <FieldLabel htmlFor="email">School Code</FieldLabel>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="m@example.com"
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="email">User Id</FieldLabel>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="m@example.com"
                                                required
                                            />
                                        </Field>
                                        <Field>
                                            <div className="flex items-center">
                                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                                <a
                                                    href="#"
                                                    className="ml-auto text-sm underline-offset-2 hover:underline"
                                                >
                                                    Forgot your password?
                                                </a>
                                            </div>
                                            <Input id="password" type="password" required />
                                        </Field>
                                        <Field>
                                            <Button type="submit">Login</Button>
                                        </Field>
                                    </FieldGroup>
                                </form>
                                <div className="bg-muted relative hidden md:block">
                                    <img
                                        src="/login-bg.svg"
                                        alt="Image"
                                        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        <FieldDescription className="px-6 text-center">
                            <p className="text-xs text-center text-muted-foreground">
                                Powered by{" "}
                                <a
                                    href="https://loricedu.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-green-600 hover:text-green-700 hover:underline"
                                >
                                    Loric Edu
                                </a>{" "}
                                · All rights reserved
                            </p>
                        </FieldDescription>
                    </div>
                </div>
            </div>
        </AuthWrapper>
    )
}

export default Login