// ============================================================
// Slider Page Alias -> delegates to unified Banners component
// ============================================================
import Banners from './Banners'

export default function Slider(props) {
  return <Banners {...props} />
}
