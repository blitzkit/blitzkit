export async function fetchJSON<Type>(url: string) {
  const response = await fetch(url);
  const json = await response.json();
  return json as Type;
}
