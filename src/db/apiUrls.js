import { createClient } from '@supabase/supabase-js';

// Define your Supabase URL and key using Vite env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get URLs
export async function getUrls(user_id) {
  const { data, error } = await supabase.from("urls").select("*").eq("user_id", user_id);

  if (error) {
    console.error(error.message);
    throw new Error("Unable to load URLs");
  }
  return data;
}

// Function to create a URL
export async function createUrl({ title, longUrl, customUrl, user_id }, qrcode) {
  const short_url = Math.random().toString(36).substr(2, 6);
  const fileName = `qr-${short_url}`;

  // Upload QR code image
  const { error: storageError } = await supabase.storage.from("qrs").upload(fileName, qrcode);

  if (storageError) throw new Error(storageError.message);

  const qr = `${supabaseUrl}/storage/v1/object/public/qrs/${fileName}`;

  // Insert URL data into the database
  const { data, error } = await supabase
    .from("urls")
    .insert([
      {
        title,
        user_id,
        original_url: longUrl,
        custom_url: customUrl || null,
        short_url,
        qr,
      },
    ])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Error creating short URL");
  }

  return data; // Ensure this returns the ID of the created record
}

// Function to delete a URL
export async function deleteUrl(id) {
  const { data, error } = await supabase.from("urls").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Unable to delete URL");
  }

  return data;
}

export async function getLongUrl(id) {
    let {data: shortLinkData, error: shortLinkError} = await supabase
      .from("urls")
      .select("id, original_url")
      .or(`short_url.eq.${id},custom_url.eq.${id}`)
      .single();
  
    if (shortLinkError && shortLinkError.code !== "PGRST116") {
      console.error("Error fetching short link:", shortLinkError);
      return;
    }
  
    return shortLinkData;
  }
  
  export async function getUrl({id, user_id}) {
    const {data, error} = await supabase
      .from("urls")
      .select("*")
      .eq("id", id)
      .eq("user_id", user_id)
      .single();
  
    if (error) {
      console.error(error);
      throw new Error("Short Url not found");
    }
  
    return data;
  }