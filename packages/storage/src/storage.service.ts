export interface StoredObject {
  url: string;
  key: string;
}

export async function putObject(input: {
  key: string;
  bytes: Buffer;
  contentType: string;
}): Promise<StoredObject> {
  const publicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL;
  if (!publicBaseUrl) {
    return {
      key: input.key,
      url: `/uploads/${input.key.split("/").at(-1)}`
    };
  }

  return {
    key: input.key,
    url: `${publicBaseUrl.replace(/\/$/, "")}/${input.key}`
  };
}
