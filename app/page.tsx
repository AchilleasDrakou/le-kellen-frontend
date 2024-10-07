import dynamic from 'next/dynamic'

const AssistanceApp = dynamic(() => import('../components/AssistanceApp'), { ssr: false })

export default function Home() {
  return <AssistanceApp />
}