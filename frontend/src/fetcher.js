export async function fetchData(url, options = {}) {
    console.log('fetchData called with URL:', url);
    
    const accessToken = localStorage.getItem('access-token');
    const refreshToken = localStorage.getItem('refresh-token');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    };

    let response = await fetch(url, {method:options.method ? options.method : "GET", headers});

    if(response.status === 401 && refreshToken) {
        // if the access token is expired, try to refresh it

        console.log('Access token expired, trying to refresh it...');

        const refreshResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`,
            }, body: JSON.stringify({ refreshToken })
        });

        if(refreshResponse.ok) {
            const { accessToken, refreshToken } = await refreshResponse.json();
            localStorage.setItem('access-token', accessToken);
            localStorage.setItem('refresh-token', refreshToken);

            // Retry the original request with the new access token
            headers['Authorization'] = `Bearer ${accessToken}`;
            response = await fetch(url, { headers });
        } else {
            // If refresh token is also expired or invalid, redirect to login
            console.error('Failed to refresh token:', refreshResponse.statusText);
            localStorage.removeItem('access-token');
            localStorage.removeItem('refresh-token');
            window.location.href = '/login'; // Redirect to login page
        }
    }

    console.log('if reach here, the fetch was successful');
    return response;
}