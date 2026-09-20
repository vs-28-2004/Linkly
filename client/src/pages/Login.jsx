import React from 'react'
import { SignIn } from '@clerk/clerk-react'
import { Image, MessageCircle, Users } from 'lucide-react'
import Logo from '../components/Logo'

const perks = [
  { Icon: Image, text: 'Share photos and thoughts with the people who matter' },
  { Icon: Users, text: 'Follow friends and turn mutual follows into connections' },
  { Icon: MessageCircle, text: 'Chat one-to-one, right inside Linkly' },
]

const Login = () => {
  return (
    <div
      className="flex min-h-screen flex-col md:flex-row"
      style={{
        backgroundColor: '#fffaf6',
        backgroundImage:
          'radial-gradient(60rem 40rem at 10% 0%, rgba(253,122,58,0.22), transparent 60%), radial-gradient(50rem 36rem at 95% 15%, rgba(233,51,130,0.16), transparent 60%), radial-gradient(45rem 30rem at 55% 105%, rgba(255,200,166,0.35), transparent 60%)',
      }}
    >
      {/* Left: branding */}
      <div className="flex flex-1 flex-col justify-between gap-10 p-6 md:p-10 lg:pl-32">
        <Logo size={40} />

        <div>
          <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight text-stone-900 md:text-6xl">
            Your people,
            <br />
            <span className="bg-linear-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">one link away.</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-stone-600">Post, follow, connect and chat — a home for the conversations you actually care about.</p>

          <ul className="mt-8 space-y-3">
            {perks.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-stone-700">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <span className="hidden md:block md:h-4"></span>
      </div>

      {/* Right: sign in */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <SignIn routing="hash" />
      </div>
    </div>
  )
}

export default Login
