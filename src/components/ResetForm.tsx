"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { ResetFormSchema } from "@/lib/definitions";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { redirect, useSearchParams } from "next/navigation";
import { resetPassword } from "@/actions/user";
import { z } from "zod";

export default function ResetForm(params: { token: string }) {
    const t = useTranslations("components.auth.reset");
    const [loading, setLoading] = useState<boolean>(false);
    const searchParams = useSearchParams();

    const form = useForm({
        resolver: zodResolver(ResetFormSchema),
        defaultValues: {
            password: '',
            passwordConfirmation: ''
        }
    });

    const onSubmit = async (data: z.infer<typeof ResetFormSchema>) => {
        setLoading(true);
        const r = await resetPassword(params.token, data)
        setLoading(false);

        if (!r) {
            toast({
                title: t('form.error.title'),
                description: t('form.error.message'),
                variant: "destructive"
            });
            return
        }

        toast({
            title: t('form.success.title'),
            description: t('form.success.description'),
        });

        redirect("/")
    };

    return (
        <Card className={"mx-1 md:w-96"}>
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                {searchParams.get('error')
                    ? <div className="w-full p-3 bg-red-500 text-sm text-white rounded-md mb-4">
                        {t('error')}
                    </div>
                    : null
                }
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className={"space-y-4"}>
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('form.fields.password.label')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('form.fields.password.placeholder')} type={"password"} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="passwordConfirmation"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex justify-between">
                                        <FormLabel>{t('form.fields.passwordConfirmation.label')}</FormLabel>
                                        {/* <Button variant={"link"} className="ml-auto p-0 h-fit focus-visible:ring-offset-2" asChild>
                                            <Link href={`/forgot-password`} className="">{t('form.actions.forgotPassword')}</Link>
                                        </Button> */}
                                    </div>
                                    <FormControl>
                                        <Input placeholder={t('form.fields.passwordConfirmation.placeholder')} type={"password"} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {loading
                            ? <Button className={"ml-auto mr-0 flex"} type="submit" disabled><Loader2 className="animate-spin mr-2" /> {t('form.actions.submitting')}</Button>
                            : <Button className={"block ml-auto mr-0"} type="submit"> {t('form.actions.submit')}</Button>
                        }
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
