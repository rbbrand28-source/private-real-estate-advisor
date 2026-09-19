import Chatbot from './components/Chatbot'

export default function App() {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-stone-800 tracking-wide">
            Private Real Estate Advisor
          </h1>
          <p className="text-stone-500 text-sm mt-2">
            Discreet guidance for discerning clients
          </p>
        </div>
        <Chatbot />
      </div>
    </div>
  )
}
