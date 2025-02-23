export async function fetchData(endpoint: string, method = 'GET', body?: any) {
  try {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint,
        method,
        body
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch data');
    return data;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
} 