import { OurFileRouter } from "@/app/api/uploading/core";
import { generateReactHelpers } from "@uploadthing/react/hooks";

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();
