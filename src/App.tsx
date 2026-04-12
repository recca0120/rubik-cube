import { WelcomePage } from '@/components/kids/WelcomePage'
import { Wizard } from '@/components/kids/Wizard'
import { Sandbox } from '@/components/kids/Sandbox'
import { ExpertHome } from '@/components/kids/ExpertHome'
import { ExpertPage } from '@/components/kids/ExpertPage'
import { GitHubLink } from '@/components/GitHubLink'
import { useCubeStore } from '@/store/cubeStore'

export default function App() {
  const appMode = useCubeStore((s) => s.appMode)
  const setAppMode = useCubeStore((s) => s.setAppMode)
  let page
  if (appMode === 'welcome') page = <WelcomePage />
  else if (appMode === 'wizard') page = <Wizard onExit={() => setAppMode('welcome')} />
  else if (appMode === 'sandbox') page = <Sandbox onExit={() => setAppMode('welcome')} />
  else if (appMode === 'expert') page = <ExpertGate />
  else page = <WelcomePage />
  return (
    <>
      {page}
      <GitHubLink />
    </>
  )
}

function ExpertGate() {
  const onboarded = useCubeStore((s) => s.expertOnboarded)
  const setOnboarded = useCubeStore((s) => s.setExpertOnboarded)
  const setAppMode = useCubeStore((s) => s.setAppMode)
  if (!onboarded) {
    return (
      <ExpertHome
        onEnter={() => setOnboarded(true)}
        onExit={() => setAppMode('welcome')}
      />
    )
  }
  return <ExpertPage onExit={() => setAppMode('welcome')} />
}
