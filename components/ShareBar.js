import { siteConfig } from '@/lib/config'
import dynamic from 'next/dynamic'

const ShareButtons = dynamic(() => import('@/components/ShareButtons'), {
  ssr: false
})

/**
 * 分享栏
 * @param {} param0
 * @returns
 */
const shareBarEnabled = () => {
  const raw = siteConfig('POST_SHARE_BAR_ENABLE')
  if (typeof raw === 'boolean') return raw
  if (raw === 'true') return true
  try {
    return JSON.parse(raw) === true
  } catch {
    return false
  }
}

const ShareBar = ({ post }) => {
  if (!shareBarEnabled() || !post || post?.type !== 'Post') {
    return <></>
  }

  return (
    <div className='m-1 overflow-x-auto scroll-hidden'>
      <div className='flex w-max min-w-full flex-nowrap md:w-full md:justify-end [&>*]:shrink-0'>
        <ShareButtons post={post} />
      </div>
    </div>
  )
}
export default ShareBar
