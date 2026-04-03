import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <main className='min-h-screen flex items-center justify-center p-4 bg-[#0c0f1a]'>
      {/* Ambient glow */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl' />
      </div>

      <div className='relative w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-bold text-slate-100'>
            Create your account
          </h1>
        </div>

        {/* Card */}
        <div className='bg-slate-900/80 border border-slate-700/60 rounded-2xl p-6 shadow-2xl shadow-black/30 backdrop-blur-sm'>
          <RegisterForm />
        </div>
      </div>
    </main>
  )
}
