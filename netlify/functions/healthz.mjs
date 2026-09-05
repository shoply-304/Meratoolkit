export default async function handler() {
  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
