import React, { useState, useEffect, useRef } from 'react'

export default function ChatAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello Amal! I am your DiaShield AI health assistant. How can I help you manage your diabetes and clinical parameters today?',
      time: '12:00 PM'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  
  const messagesEndRef = useRef(null)

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const suggestedChips = [
    'What foods should I avoid?',
    'What are diabetes symptoms?',
    'Exercise suggestions'
  ]

  const getAiResponse = (userText) => {
    const text = userText.toLowerCase()
    
    if (text.includes('food') || text.includes('avoid') || text.includes('eat') || text.includes('dining')) {
      return (
        <div className="space-y-3">
          <p>Dining out and nutritional management can be tricky, but navigating glycemic values is straightforward if done carefully:</p>
          <div className="bg-red-500/10 border-l-2 border-error p-3 rounded-r-lg mt-2 mb-3">
            <h4 className="font-label-md text-label-md text-error mb-1 uppercase tracking-wider text-[11px]">High Risk (Avoid or Limit)</h4>
            <ul className="list-disc pl-4 text-xs text-on-surface-variant space-y-1">
              <li>Standard refined grains and pasta (high glycemic load)</li>
              <li>Risotto and white arborio rice (spikes postprandial glucose rapidly)</li>
              <li>Heavy saturated cream sauces (Alfredo, rich dressings)</li>
              <li>Garlic bread and traditional thick pizza crusts</li>
            </ul>
          </div>
          <div className="bg-[#4cd7f6]/10 border-l-2 border-[#4cd7f6] p-3 rounded-r-lg">
            <h4 className="font-label-md text-label-md text-[#4cd7f6] mb-1 uppercase tracking-wider text-[11px]">Optimal Choices</h4>
            <ul className="list-disc pl-4 text-xs text-on-surface-variant space-y-1">
              <li>Grilled proteins (Salmon, Chicken Breast, Lean Beef)</li>
              <li>Fiber-rich vegetable soups (Minestrone, broth bases)</li>
              <li>Low-carb zoodles or spiralized zucchini</li>
              <li>Fresh leafy greens with extra virgin olive oil</li>
            </ul>
          </div>
          <p className="text-xs opacity-75">Would you like me to simulate the potential impact of a specific meal on your current glucose trend?</p>
        </div>
      )
    }

    if (text.includes('symptom') || text.includes('diabetic') || text.includes('signs')) {
      return (
        <div className="space-y-3">
          <p>Key clinical indicators of diabetes onset or glycemic dysregulation include:</p>
          <div className="bg-orange-500/10 border-l-2 border-orange-400 p-3 rounded-r-lg">
            <ul className="list-disc pl-4 text-xs text-on-surface-variant space-y-1">
              <li><strong className="text-white">Polydipsia:</strong> Excessive thirst that cannot be easily quenched.</li>
              <li><strong className="text-white">Polyuria:</strong> Frequent urination, especially during sleep.</li>
              <li><strong className="text-white">Polyphagia:</strong> Persistent intense hunger, even after eating.</li>
              <li><strong className="text-white">Systemic Fatigue:</strong> Chronic exhaustion from inefficient cellular glucose absorption.</li>
              <li><strong className="text-white">Blurred Vision:</strong> Caused by temporary fluid shifts in the eye lenses.</li>
            </ul>
          </div>
          <p className="text-xs opacity-75">If you are currently experiencing any of these, let me know. I can assist in scheduling an urgent visit with Dr. Jenkins.</p>
        </div>
      )
    }

    if (text.includes('exercise') || text.includes('workout') || text.includes('sport') || text.includes('activity')) {
      return (
        <div className="space-y-3">
          <p>Regular physical exercise is a highly effective tool for improving insulin sensitivity and lowering HbA1c values:</p>
          <div className="bg-green-500/10 border-l-2 border-green-400 p-3 rounded-r-lg">
            <ul className="list-disc pl-4 text-xs text-on-surface-variant space-y-1">
              <li><strong className="text-white">Aerobic Exercise:</strong> Walking, swimming, or cycling for 150 minutes per week.</li>
              <li><strong className="text-white">Resistance Training:</strong> 2-3 sessions per week to build muscle mass, which increases glucose storage capacity.</li>
              <li><strong className="text-white">Pre-workout Monitoring:</strong> Check your blood glucose. If it is below 100 mg/dL, consume a small 15g carbohydrate snack first.</li>
            </ul>
          </div>
          <p className="text-xs opacity-75">Would you like assistance in formulating a weekly fitness log tailored to your current lifestyle parameters?</p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <p>I have registered your inquiry regarding: "{userText}".</p>
        <p>Your ongoing glucose margins are currently stable (averaging 112 mg/dL), meaning your Metformin dosage is effectively controlling your HbA1c curves. However, let me know if there are any specific physical or clinical observations you would like to discuss.</p>
        <p className="text-xs opacity-75">Please note: As your AI assistant, I provide helpful educational support. For direct diagnostic changes, please coordinate with your primary care provider.</p>
      </div>
    )
  }

  const handleSend = (textToSend) => {
    if (!textToSend.trim()) return

    const now = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })

    // Append User Message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: now
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setLoading(true)

    // Simulate AI Response Delay
    setTimeout(() => {
      setLoading(false)
      const aiReply = {
        id: Date.now() + 1,
        sender: 'ai',
        component: getAiResponse(textToSend),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiReply])
    }, 1200)
  }

  return (
    <div className="h-[calc(100vh-5rem)] md:h-screen flex flex-col relative bg-surface">
      {/* Header */}
      <header className="bg-surface-dim/80 backdrop-blur-xl border-b border-white/10 shadow-sm flex justify-between items-center px-gutter py-unit-4 w-full sticky top-0 z-40">
        <div className="flex-1">
          <span className="font-headline-md text-headline-md text-on-surface font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
            AI Medical Assistant
          </span>
          <span className="block font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">Endocrinology Support System</span>
        </div>
        <button 
          onClick={() => alert('DiaShield Care System: Complete clinical AI chat protocols are active.')}
          className="text-on-surface-variant hover:text-tertiary transition-colors duration-200"
        >
          <span className="material-symbols-outlined">help</span>
        </button>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-gutter py-unit-6 space-y-6 pb-40">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex items-start gap-4 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white/5 ${msg.sender === 'ai' ? 'bg-primary-container text-tertiary' : 'bg-secondary-container text-secondary'}`}>
              <span className="material-symbols-outlined text-[20px]">
                {msg.sender === 'ai' ? 'smart_toy' : 'person'}
              </span>
            </div>

            {/* Bubble */}
            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : ''}`}>
              <div className={`glass-card rounded-2xl p-unit-4 shadow-[0_4px_24px_rgba(0,0,0,0.2)] border border-white/5 ${msg.sender === 'ai' ? 'rounded-tl-none ring-1 ring-secondary-container/20' : 'rounded-tr-none bg-[#7c3aed]/10 border-[#7c3aed]/25'}`}>
                <div className="font-body-md text-body-md text-on-surface leading-relaxed">
                  {msg.component ? msg.component : <p>{msg.text}</p>}
                </div>
              </div>
              <span className="text-[10px] text-on-surface-variant mt-1.5 opacity-60 font-label-md">{msg.time}</span>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-4 max-w-3xl">
            <div className="w-10 h-10 rounded-full bg-primary-container text-tertiary flex items-center justify-center shrink-0 border border-white/5">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div className="flex flex-col">
              <div className="glass-card rounded-2xl rounded-tl-none p-4 shadow-md border border-white/5">
                <div className="flex items-center gap-1.5 py-1 text-on-surface-variant opacity-60">
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Sticky Panel */}
      <div className="absolute bottom-0 left-0 w-full p-gutter pt-0 bg-gradient-to-t from-background via-background/95 to-transparent pb-[calc(1.5rem+80px)] md:pb-gutter z-30">
        <div className="max-w-3xl mx-auto">
          {/* Suggestion Chips */}
          <div className="flex gap-unit-2 mb-unit-4 overflow-x-auto hide-scroll w-full pb-1">
            {suggestedChips.map((chip, i) => (
              <button 
                key={i}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-unit-4 py-unit-2 rounded-full border border-white/10 bg-surface-container-high/50 hover:bg-white/10 hover:border-tertiary/30 text-on-surface-variant hover:text-tertiary font-label-md text-label-md cursor-pointer transition-all backdrop-blur-md"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Box */}
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              handleSend(inputValue)
            }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary-container/30 to-tertiary/20 rounded-xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center gap-2 bg-surface-container-high/90 backdrop-blur-xl rounded-xl p-2 border border-white/10 focus-within:border-tertiary/50 transition-colors shadow-lg">
              <button 
                type="button"
                onClick={() => alert('Attachments: PDF Clinical logs or laboratory data can be uploaded here.')}
                className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
              </button>
              <input 
                className="bg-transparent flex-1 border-none outline-none text-on-surface font-body-md text-body-md p-2 placeholder:text-on-surface-variant/50 focus:ring-0" 
                placeholder="Ask DiaShield AI anything about your health..." 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-tertiary text-on-tertiary w-10 h-10 rounded-lg flex items-center justify-center hover:bg-tertiary-fixed-dim hover:shadow-[0_0_15px_rgba(76,215,246,0.4)] transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
