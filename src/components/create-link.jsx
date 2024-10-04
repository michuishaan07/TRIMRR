import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate, useSearchParams } from "react-router-dom";
import Error from "@/components/error";
import * as yup from "yup";
import useFetch from "@/hooks/use-fetch";
import { createUrl } from "@/db/apiUrls";
import { BeatLoader } from "react-spinners";
import { UrlState } from "@/context";
import { QRCodeCanvas } from "qrcode.react"; // Change to a simpler QR code library

export function CreateLink() {
  const { user } = UrlState();
  const navigate = useNavigate();
  const ref = useRef();
  let [searchParams, setSearchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState({
    title: "",
    longUrl: longLink ? longLink : "",
    customUrl: "",
  });

  const schema = yup.object().shape({
    title: yup.string().required("Title is required"),
    longUrl: yup
      .string()
      .url("Must be a valid URL")
      .required("Long URL is required"),
    customUrl: yup.string(),
  });

  const handleChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
  };

  const { loading, error, data, fn: fnCreateUrl } = useFetch(createUrl, {
    ...formValues,
    user_id: user.id,
  });

  useEffect(() => {
    console.log("Error:", error);
    console.log("Data:", data);
    if (!error && data) {
      console.log("Navigating to link page:", `/link/${data[0].id}`);
      navigate(`/link/${data[0].id}`);
    }
  }, [error, data, navigate]);

  const createNewLink = async () => {
    setErrors([]);
    try {
      console.log("Validating schema...");
      await schema.validate(formValues, { abortEarly: false });
      console.log("Schema validated");

      const canvas = ref.current.querySelector('canvas'); // Access the canvas from QRCodeCanvas
      console.log("Fetching canvas blob...");
      const blob = await new Promise((resolve) => canvas.toBlob(resolve));
      console.log("Canvas blob fetched");

      await fnCreateUrl(blob);
      console.log("URL created");
    } catch (e) {
      console.error(e);  // Log errors
      const newErrors = {};
      e?.inner?.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
    }
  };

  return (
    <Dialog
      defaultOpen={longLink}
      onOpenChange={(res) => {
        if (!res) setSearchParams({});
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">Create New Link</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl">Create New</DialogTitle>
        </DialogHeader>
        {formValues?.longUrl && (
          <div ref={ref}>
            <QRCodeCanvas size={250} value={formValues?.longUrl} />
          </div>
        )}

        <Input
          id="title"
          placeholder="Short Link's Title"
          value={formValues.title}
          onChange={handleChange}
        />
        {errors.title && <Error message={errors.title} />}
        <Input
          id="longUrl"
          placeholder="Enter your Loooong URL"
          value={formValues.longUrl}
          onChange={handleChange}
        />
        {errors.longUrl && <Error message={errors.longUrl} />}
        <div className="flex items-center gap-2">
          <Card className="p-2">trimrr.in</Card> /
          <Input
            id="customUrl"
            placeholder="Custom Link (optional)"
            value={formValues.customUrl}
            onChange={handleChange}
          />
        </div>
        {error && <Error message={errors.message} />}
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="destructive"
            onClick={createNewLink}
            disabled={loading}
          >
            {loading ? <BeatLoader size={10} color="white" /> : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateLink;
