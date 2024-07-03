"use client";
import React, { useCallback, useEffect, useState } from "react";
import CardWrappers from "@/components/auth/card-wrapper";
import { BeatLoader } from "react-spinners";
import { redirect, useSearchParams } from "next/navigation";
import { newVerification } from "@/actions/new-verification";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
function NewVerificationForm() {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  // URLのクエリパラメータにアクセスするためのReact Hook
  const seachParams = useSearchParams();
  const token = seachParams.get("token");

  // トークンが変わったときのみ関数を再生性する
  const onSubmit = useCallback(() => {
    if (success || error) return;
    if (!token) {
      setError("Missing Token!");
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data?.success);
        setError(data?.error);
      })
      .catch(() => {
        setError("Something went wrong");
      });
  }, [token, success, error]);

  // onSubmit関数が変更されるたびにこのuseEffectが再実行される
  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrappers
      headerLabel="Confirming your verification"
      backButtonHref="/auth/loin"
      backButtonLabel="Back to login"
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && <BeatLoader />}
        <FormSuccess message={success} />
        {!success && <FormError message={error} />}
      </div>
    </CardWrappers>
  );
}

export default NewVerificationForm;
