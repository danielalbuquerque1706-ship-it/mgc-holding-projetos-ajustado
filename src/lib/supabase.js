import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ocllezuptnrlbmhydzlml.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qbnRybHBtaHlkemxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MzI0NjQsImV4cCI6MjA0ODAwODQ2NH0.i1IpfeVlgGQ5j3qwluWvd9Q1v2F55bAUsB8v-FzWw70"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
