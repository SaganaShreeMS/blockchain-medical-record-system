const API_BASE = 'http://localhost:5000';

// Get the saved token, or redirect to login if missing
function getToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
    }
    return token;
}

// Wrapper around fetch that automatically attaches the auth token
async function apiRequest(path, method = 'GET', body = null) {
    const token = getToken();

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const res = await fetch(API_BASE + path, options);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('department');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
}