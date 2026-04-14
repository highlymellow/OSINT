import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { BookOpen, Search, Clock, Target, Globe2, ShieldAlert } from '@/lib/icons'

interface LocalEvent {
  year: string;
  title: string;
  description: string;
  type: 'conflict' | 'political' | 'social';
}

const IRAQ_CODEX: LocalEvent[] = [
  { year: '1920', title: 'The Great Iraqi Revolution', description: 'Mass uprising against the British mandate aiming to establish an independent Arab state.', type: 'conflict' },
  { year: '1932', title: 'Independence from Britain', description: 'Iraq officially becomes an independent kingdom under King Faisal I, joining the League of Nations.', type: 'political' },
  { year: '1941', title: 'Anglo-Iraqi War', description: 'Brief conflict triggered by a nationalist coup and subsequent British re-occupation of Iraq.', type: 'conflict' },
  { year: '1958', title: '14 July Revolution', description: 'The Hashemite monarchy is overthrown by the Free Officers led by Abd al-Karim Qasim, establishing the Iraqi Republic.', type: 'political' },
  { year: '1963', title: 'Ramadan Revolution', description: 'Baathist military coup d\'état overthrows Qasim.', type: 'political' },
  { year: '1968', title: '17 July Revolution', description: 'A bloodless coup brings the Arab Socialist Baath Party to power, establishing a stable, authoritarian regime.', type: 'political' },
  { year: '1979', title: 'Saddam Hussein Assumes Power', description: 'Saddam Hussein orchestrates a purge of the Baath party and seizes absolute control over the republic.', type: 'political' },
  { year: '1980', title: 'Outbreak of Iran-Iraq War', description: 'Iraq invades Iran, initiating a devastating eight-year conflict over border disputes and regional dominance.', type: 'conflict' },
  { year: '1988', title: 'Halabja Chemical Attack', description: 'The Iraqi military uses chemical weapons against the Kurdish town of Halabja during the closing days of the Iran-Iraq war.', type: 'conflict' },
  { year: '1990', title: 'Invasion of Kuwait', description: 'Iraqi forces cross the border and annex Kuwait, triggering an immediate global condemnation.', type: 'conflict' },
  { year: '1991', title: 'Operation Desert Storm', description: 'A U.S.-led coalition launches a massive military campaign, expelling Iraqi forces from Kuwait.', type: 'conflict' },
  { year: '1991', title: '1991 Uprisings (Shaaban Intifada)', description: 'Massive rebellions erupt in the northern Kurdish regions and southern Shia regions against Saddam Hussein.', type: 'conflict' },
  { year: '2003', title: 'U.S. Invasion of Iraq', description: 'A U.S.-led coalition invades Iraq, deposing Saddam Hussein and dismantling the Baathist regime.', type: 'conflict' },
  { year: '2004', title: 'Fallujah Insurgency', description: 'Fierce urban combat primarily driven by Sunni insurgent groups battling coalition forces in Al Anbar.', type: 'conflict' },
  { year: '2006', title: 'Al-Askari Shrine Bombing', description: 'Al-Qaeda in Iraq bombs the sacred Shia shrine in Samarra, severely accelerating sectarian civil war.', type: 'conflict' },
  { year: '2011', title: 'U.S. Troop Withdrawal', description: 'The last United States military forces formally exit Iraq, marking the end of the combat mandate.', type: 'political' },
  { year: '2014', title: 'ISIS Expansion & Fall of Mosul', description: 'The Islamic State (ISIS) captures Mosul and large swaths of western/northern Iraq, declaring a caliphate.', type: 'conflict' },
  { year: '2014', title: 'Camp Speicher Massacre', description: 'ISIS militants execute over 1,700 unarmed Iraqi Air Force cadets in Tikrit.', type: 'conflict' },
  { year: '2017', title: 'Liberation of Mosul', description: 'Iraqi Security Forces and coalition allies recapture Mosul, effectively ending ISIS territorial control in Iraq.', type: 'conflict' },
  { year: '2019', title: 'Tishreen Protests', description: 'Massive anti-government civilian protests erupt across Baghdad and southern Iraq over corruption and Iranian influence.', type: 'social' },
  { year: '2020', title: 'Baghdad Airport Strike', description: 'A U.S. drone strike kills Iranian Quds Force commander Qasem Soleimani and PMF leader Abu Mahdi al-Muhandis.', type: 'conflict' },
]

export default function CodexView() {
  const [search, setSearch] = useState('')

  const filteredTimeline = useMemo(() => {
    if (!search) return IRAQ_CODEX
    const lowerSearch = search.toLowerCase()
    return IRAQ_CODEX.filter(e => 
      e.year.includes(lowerSearch) || 
      e.title.toLowerCase().includes(lowerSearch) || 
      e.description.toLowerCase().includes(lowerSearch)
    )
  }, [search])

  return (
    <div className="p-8 h-full flex flex-col animate-fade-in relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
            <BookOpen size={32} weight="duotone" className="text-amber-500" />
            CODEX — Archival Timeline
          </h1>
          <p className="text-sm text-text-muted mt-1 max-w-xl">
            Chronological reconstruction of major geopolitical, social, and kinetic events shaping the Iraqi theater over the last century.
          </p>
        </div>
        
        <div className="relative w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by year, conflict, or entity..."
            className="w-full pl-11 pr-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-white placeholder:text-amber-500/50 focus:outline-none focus:border-amber-400 font-mono transition-colors"
          />
        </div>
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto pr-4 relative space-y-6 pb-20">
         <div className="absolute left-6 top-4 bottom-0 w-px bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
         
         {filteredTimeline.map((item, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.05 }}
               className="relative pl-16 group"
            >
               <div className="absolute left-[22px] top-4 w-3 h-3 rounded-full bg-amber-500 border-4 border-deep-black group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(245,158,11,1)]" />
               <div className="glass-card-solid p-6 border-amber-500/10 hover:border-amber-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-4">
                        <span className="text-2xl font-black font-mono tracking-tighter text-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{item.year}</span>
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{item.title}</h3>
                     </div>
                     <span className={`px-2 py-1 uppercase text-[9px] font-bold tracking-widest rounded border ${
                        item.type === 'conflict' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                        item.type === 'political' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/30'
                     }`}>
                        {item.type}
                     </span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed font-sans">{item.description}</p>
               </div>
            </motion.div>
         ))}
         
         {filteredTimeline.length === 0 && (
            <div className="pl-16 py-12 text-center text-amber-500/50 font-mono text-sm max-w-lg mx-auto">
               No archival records found matching the query.
            </div>
         )}
      </div>
    </div>
  )
}
