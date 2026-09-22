import { render } from 'preact'
import '@fontsource/reem-kufi/500.css'
import '@fontsource/reem-kufi/700.css'
import '@fontsource/ibm-plex-sans-arabic/400.css'
import '@fontsource/ibm-plex-sans-arabic/500.css'
import '@fontsource/ibm-plex-sans-arabic/700.css'
import './styles.css'
import { App } from './app'

render(<App />, document.getElementById('app')!)
