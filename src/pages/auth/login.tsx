import { useState } from "react"

// shadcn-imports
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import useAuth from "@/hooks/useAuth"
import AuthWrapper from "@/sections/auth/AuthWrapper"
import { useNavigate } from "react-router-dom"

function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const trimmedEmail = email.trim();
            const res = await login(trimmedEmail, password)
            console.log(res)
            console.log("Login successful")
            navigate("/")
        } catch (err: any) {
            console.error(err)
            setError(err?.message || "Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthWrapper>
            <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm md:max-w-4xl">
                    <div className="flex flex-col gap-6">
                        <Card className="overflow-hidden p-0">
                            <CardContent className="grid p-0 md:grid-cols-2">
                                <form className="p-6 md:p-8" onSubmit={handleLogin}>
                                    <FieldGroup>
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <img
                                                src="/attenzy-logo.png"
                                                alt="attenzy-login"
                                                className="h-15 mb-4"
                                            />
                                            <p className="text-muted-foreground text-balance">
                                                Login to your Attenzy IOT account
                                            </p>
                                        </div>

                                        <Field>
                                            <FieldLabel htmlFor="email">User Id</FieldLabel>
                                            <Input
                                                id="email"
                                                type="text"
                                                placeholder="m@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
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
                                            <Input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </Field>

                                        {error && (
                                            <p className="text-sm text-destructive text-center">
                                                {error}
                                            </p>
                                        )}

                                        <Field>
                                            <Button
                                                type="submit"
                                                className="bg-primary w-full"
                                                disabled={loading}
                                            >
                                                {loading ? "Logging in..." : "Login"}
                                            </Button>
                                        </Field>
                                    </FieldGroup>
                                </form>

                                <div className="bg-muted relative hidden md:block">
                                    <img
                                        src="/login-bg.svg"
                                        alt="Login background"
                                        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <FieldDescription className="px-6 text-center">
                            <p className="text-xs text-muted-foreground">
                                Powered by{" "}
                                <a
                                    href="https://loricedu.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-green-600 hover:underline"
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
