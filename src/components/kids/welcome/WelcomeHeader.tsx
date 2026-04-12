import { CubieDialog } from '../Cubie'

export function WelcomeHeader({ greeting }: { greeting: string }) {
  return (
    <>
      <div className="text-center mb-3 anim-slide">
        <h1 className="font-display text-4xl md:text-6xl" style={{ color: 'var(--ink)' }}>
          魔方學園
        </h1>
        <div className="font-body text-xs md:text-sm mt-1 opacity-70">
          Cube Academy · 跟 Cubie 一起玩
        </div>
      </div>
      <div className="anim-fadeup" style={{ animationDelay: '0.2s' }}>
        <CubieDialog emotion="cheering" message={greeting} typewriterMs={0} gesture="thumbsup" />
      </div>
    </>
  )
}
