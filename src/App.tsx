import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ChapterPage } from './pages/ChapterPage'
import { GlossaryPage } from './pages/GlossaryPage'
import { AccountPage } from './pages/AccountPage'

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

  return (
    <BrowserRouter basename={basename || undefined}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/chapter/:slug" element={<ChapterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
