export async function fetchData(url, options = {}) {
  console.log("fetchData called with URL:", url);

  const accessToken = localStorage.getItem("access-token");
  const refreshToken = localStorage.getItem("refresh-token");

  // Determine content type based on the body type
  let contentType = "application/json";
  let body = options.body;

  if (body instanceof FormData) {
    contentType = null; // Let the browser set the content type for FormData
  } else if (options.contentType) {
    contentType = options.contentType;
  }

  const headers = {
    ...(contentType && { "Content-Type": contentType }),
    Authorization: `Bearer ${accessToken}`,
  };

  // Prepare the body based on content type
  if (
    body &&
    !(body instanceof FormData) &&
    contentType === "application/json"
  ) {
    body = JSON.stringify(body);
  }

  let response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body,
  });

  if (response.status === 401 && refreshToken) {
    console.log("Access token expired, trying to refresh it...");

    const refreshResponse = await fetch(
      `${process.env.REACT_APP_API_URL}/api/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (refreshResponse.ok) {
      const { accessToken, refreshToken } = await refreshResponse.json();
      localStorage.setItem("access-token", accessToken);
      localStorage.setItem("refresh-token", refreshToken);

      // Retry the original request with the new access token
      headers["Authorization"] = `Bearer ${accessToken}`;
      response = await fetch(url, {
        method: options.method || "GET",
        headers,
        body,
      });
    } else {
      console.error("Failed to refresh token:", refreshResponse.statusText);
      localStorage.removeItem("access-token");
      localStorage.removeItem("refresh-token");
      window.location.href = "/login";
    }
  }

  console.log("if reach here, the fetch was successful");
  return response;
}
