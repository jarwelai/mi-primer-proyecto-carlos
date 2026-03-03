'use client'

import { useState, useEffect } from 'react'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos dias'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

interface GreetingProps {
  name: string
}

export function Greeting({ name }: GreetingProps) {
  const [greeting, setGreeting] = useState<string | null>(null)

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  if (!greeting) return <span>{name}</span>

  return <>{greeting}, {name}</>
}
