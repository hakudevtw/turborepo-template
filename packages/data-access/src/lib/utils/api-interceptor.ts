import axios from "axios";
import type { z } from "zod";

export enum HTTPMethod {
  GET = "GET",
  POST = "POST",
}

// export enum HTTPStatusCode {
//   OK = 200,
// }

export function api<Request, Response>({
  method = HTTPMethod.GET,
  path,
  requestSchema,
  responseSchema,
}: {
  method?: HTTPMethod;
  path: string;
  requestSchema: z.ZodType<Request>;
  responseSchema: z.ZodType<Response>;
}): (data: Request) => Promise<Response> {
  return function (requestData: Request) {
    requestSchema.parse(requestData);

    async function apiCall() {
      const response = await axios({
        // baseURL: process.env.API_URL,
        method,
        url: path,
        [method === HTTPMethod.GET ? "params" : "data"]: requestData,
      });

      responseSchema.safeParseAsync(response.data).then((result) => {
        if (!result.success) {
          // TODO: Send error to sentry or other error reporting service

          // TODO: Show or throw custom Error
          console.error("🔥 API Error", {
            path,
            method,
            error: result.error.issues,
          });
        }
      });

      return response.data as Response;
    }

    return apiCall();
  };
}
