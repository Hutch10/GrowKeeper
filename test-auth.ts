import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hexzaduzzqpluixwfgdh.supabase.co'
const supabaseAnonKey = 'sb_publishable_hCn4hpKWUfJtVrQKyRMVBA_py4PiUQk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  const email = `test_${Date.now()}@example.com`
  const password = 'password123'

  console.log(`Testing Sign Up with ${email}...`)
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
    console.error('Sign Up Error:', signUpError.message)
  } else {
    console.log('Sign Up Success:', signUpData.user?.email)
    console.log('Session present:', !!signUpData.session)
  }

  console.log('\nTesting Sign In...')
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    console.error('Sign In Error:', signInError.message)
  } else {
    console.log('Sign In Success:', signInData.user?.email)
  }
}

testAuth()
