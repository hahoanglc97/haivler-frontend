export const setCookie = (name: string, value: any) => {
  const now = new Date();
  now.setTime(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours in milliseconds
  const expires = "expires=" + now.toUTCString();
  document.cookie = `${name}=${value}; ${expires}; path=/`;
};

export const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts: Array<any> = value.split(`; ${name}=`);
  if ((parts || []).length === 2) return parts.pop().split(";").shift();
  return null; // Return null if not found
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};
