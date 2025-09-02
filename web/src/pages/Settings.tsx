import React, { useState } from 'react'
import TopTabsInline from '@/components/TopTabsInline'
import useThemedGradient from '@/hooks/useThemedGradient'
import { CalendarDays, Trophy, Zap, RotateCcw, Trash2, Download, Upload } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import Slider from '@/components/ui/slider'
import { useTheme, PALETTES, type Palette, type Mode } from '@/store/theme'
import { useSettings, type DefaultRoute, type CurrencyCode, type GPAScale, type PomodoroPosition, type PomodoroSize } from '@/store/settingsStore'
import { useGamification } from '@/store/gamificationStore'
// stores imported in backup via localStorage keys; direct hooks not needed here

const scrollbarStyles = `
	.light-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
	.light-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 5px; }
	.light-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.20); border-radius: 5px; }
	.light-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.30); }
	.dark-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
	.dark-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.10); border-radius: 5px; }
	.dark-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.20); border-radius: 5px; }
	.dark-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.30); }
`;

export default function Settings() {
	const bgStyle = useThemedGradient()
	const theme = useTheme()
	const settings = useSettings()
	const gamification = useGamification()
	const [gamificationPanelOpen, setGamificationPanelOpen] = useState(false)

	function scrollTo(id: string) {
		const el = document.getElementById(id)
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}

	// Backup & restore (JSON of persisted slices)
	async function exportData() {
		const payload = {
			settings: localStorage.getItem('aq:settings'),
			theme: localStorage.getItem('aq:theme'),
			plan: localStorage.getItem('aq:academic-plan'),
			schedule: localStorage.getItem('aq:schedule'),
			tasks: localStorage.getItem('aq:tasks'),
			scholarships: localStorage.getItem('aq:scholarships'),
			textbooks: localStorage.getItem('aq:textbooks'),
			studySessions: localStorage.getItem('aq:study-sessions'),
			gamification: localStorage.getItem('aq:gamification'),
		}
		const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'academicquest-backup.json'
		a.click()
		URL.revokeObjectURL(url)
	}

	async function importData() {
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = 'application/json'
		input.onchange = async () => {
			const f = input.files?.[0]
			if (!f) return
			const text = await f.text()
			try {
				const obj = JSON.parse(text)
				if (obj.settings) localStorage.setItem('aq:settings', obj.settings)
				if (obj.theme) localStorage.setItem('aq:theme', obj.theme)
				if (obj.plan) localStorage.setItem('aq:academic-plan', obj.plan)
				if (obj.schedule) localStorage.setItem('aq:schedule', obj.schedule)
				if (obj.tasks) localStorage.setItem('aq:tasks', obj.tasks)
				if (obj.scholarships) localStorage.setItem('aq:scholarships', obj.scholarships)
				if (obj.textbooks) localStorage.setItem('aq:textbooks', obj.textbooks)
				if (obj.studySessions) localStorage.setItem('aq:study-sessions', obj.studySessions)
				if (obj.gamification) localStorage.setItem('aq:gamification', obj.gamification)
				window.location.reload()
			} catch {
				alert('Invalid backup file')
			}
		}
		input.click()
	}

	// Gamification reset functions
	const resetGamificationData = () => {
		if (confirm('Are you sure you want to reset all gamification data? This will clear your level, XP, badges, and streaks. This action cannot be undone.')) {
			localStorage.removeItem('aq:gamification')
			window.location.reload()
		}
	}

	const resetStreaks = () => {
		if (confirm('Are you sure you want to reset your streaks? This will set your current and longest streaks to 0.')) {
			gamification.updateStats({ 
				streakDays: 0, 
				longestStreak: 0 
			})
		}
	}

	const clearAllData = () => {
		if (confirm('Are you sure you want to clear ALL data? This will reset everything including settings, academic plans, tasks, and gamification progress. This action cannot be undone.')) {
			// Clear all localStorage data
			const keys = Object.keys(localStorage).filter(key => key.startsWith('aq:'))
			keys.forEach(key => localStorage.removeItem(key))
			window.location.reload()
		}
	}

	return (
			<div className="min-h-screen w-full" style={bgStyle}>
				<style>{scrollbarStyles}</style>
				<div className="max-w-[1400px] mx-auto px-3 py-6 space-y-6">
					{/* Top header: title + tabs on the left, school year chip on the right */}
					<div className="flex items-start justify-between gap-4">
						<div className="flex flex-col gap-1">
							<div className="flex items-center gap-3 flex-wrap">
								<CalendarDays className="h-5 w-5" />
								<h1 className="text-2xl font-bold">Settings</h1>
							</div>
							<div className="mt-1">
								<TopTabsInline active="settings" />
							</div>
						</div>
						<div className="flex items-center gap-2 min-w-[220px] justify-end">
							<Button className="rounded-xl" onClick={importData}>Import backup</Button>
						</div>
					</div>

					<div className="flex gap-6">
						{/* Left quick navigation */
						}
						<div className="w-48 shrink-0 sticky top-4 self-start">
							<div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Sections</div>
							<div className="flex flex-col gap-2">
								<Button variant="secondary" className="justify-start rounded-xl" onClick={() => scrollTo('appearance')}>Appearance</Button>
								<Button variant="secondary" className="justify-start rounded-xl" onClick={() => scrollTo('pomodoro')}>Pomodoro Timer</Button>
								<Button variant="secondary" className="justify-start rounded-xl" onClick={() => scrollTo('nav-defaults')}>Navigation & Defaults</Button>
								<Button variant="secondary" className="justify-start rounded-xl" onClick={() => scrollTo('notifications')}>Notifications & Effects</Button>
								<Button variant="secondary" className="justify-start rounded-xl" onClick={() => scrollTo('gamification')}>Gamification</Button>
								<Button variant="secondary" className="justify-start rounded-xl" onClick={() => scrollTo('data')}>Data</Button>
							</div>
						</div>

						{/* Main centered column */}
						<div className="flex-1">
							<div className="mx-auto max-w-3xl space-y-4">
								<Card id="appearance" className="border-0 bg-white/80 dark:bg-neutral-900/60 rounded-3xl">
									<CardContent className="p-4 space-y-4">
								<div className="text-sm font-semibold">Appearance</div>
								<div className="grid grid-cols-2 gap-3 items-center">
									<label className="text-sm">Theme mode</label>
									<Select value={theme.mode} onValueChange={(v) => theme.setMode(v as Mode)}>
										<SelectTrigger className="h-8"><SelectValue placeholder="Mode"/></SelectTrigger>
										<SelectContent>
											<SelectItem value="light">Light</SelectItem>
											<SelectItem value="dark">Dark</SelectItem>
											<SelectItem value="system">System</SelectItem>
										</SelectContent>
									</Select>

									<label className="text-sm">Palette</label>
									<Select value={theme.palette} onValueChange={(v) => theme.setPalette(v as Palette)}>
										<SelectTrigger className="h-8"><SelectValue placeholder="Palette"/></SelectTrigger>
										<SelectContent>
											{Object.keys(PALETTES).map(p => (
												<SelectItem key={p} value={p}>{p}</SelectItem>
											))}
										</SelectContent>
									</Select>

									<label className="text-sm">Font family</label>
									<Select value={theme.font} onValueChange={(v)=> theme.setFont(v)}>
										<SelectTrigger className="h-8"><SelectValue placeholder="Font"/></SelectTrigger>
										<SelectContent>
											{["Inter","Poppins","Nunito","Outfit","Roboto","Lato","Montserrat","Source Sans 3"].map(f => (
												<SelectItem key={f} value={f}>{f}</SelectItem>
											))}
										</SelectContent>
									</Select>

									<label className="text-sm">Accent</label>
									<Slider value={[theme.accent]} min={0} max={100} step={1} onValueChange={([v]) => theme.setAccent(v)} />

									<label className="text-sm">Radius</label>
									<Slider value={[theme.radius]} min={8} max={24} step={1} onValueChange={([v]) => theme.setRadius(v)} />

									<label className="text-sm">Text scale</label>
									<Slider value={[theme.textScale * 100]} min={90} max={110} step={1} onValueChange={([v]) => theme.setTextScale(Number((v/100).toFixed(2)))} />

									<label className="text-sm">Reduced motion</label>
									<Switch checked={settings.reducedMotion} onCheckedChange={(b)=>settings.set({ reducedMotion: b })} />

									<label className="text-sm">Gradients</label>
									<Switch checked={settings.gradientsEnabled} onCheckedChange={(b)=>settings.set({ gradientsEnabled: b })} />
								</div>
								</CardContent>
							</Card>

							<Card id="pomodoro" className="border-0 bg-white/80 dark:bg-neutral-900/60 rounded-3xl">
								<CardContent className="p-4 space-y-4">
								<div className="text-sm font-semibold">Pomodoro Timer</div>
								<div className="grid grid-cols-2 gap-3 items-center">
									<label className="text-sm">Position</label>
									<Select value={settings.pomodoroPosition} onValueChange={(v)=>settings.set({ pomodoroPosition: v as PomodoroPosition })}>
										<SelectTrigger className="h-8"><SelectValue placeholder="Position"/></SelectTrigger>
										<SelectContent>
											<SelectItem value="draggable">Draggable (Snap to corners)</SelectItem>
											<SelectItem value="tl">Static - Top Left</SelectItem>
											<SelectItem value="tr">Static - Top Right</SelectItem>
											<SelectItem value="bl">Static - Bottom Left</SelectItem>
											<SelectItem value="br">Static - Bottom Right</SelectItem>
										</SelectContent>
									</Select>

									<label className="text-sm">Timer size</label>
									<Select value={settings.pomodoroSize} onValueChange={(v)=>settings.set({ pomodoroSize: v as PomodoroSize })}>
										<SelectTrigger className="h-8"><SelectValue placeholder="Size"/></SelectTrigger>
										<SelectContent>
											<SelectItem value="small">Small</SelectItem>
											<SelectItem value="medium">Medium</SelectItem>
											<SelectItem value="large">Large</SelectItem>
										</SelectContent>
									</Select>

									<label className="text-sm">Auto-hide when not running</label>
									<Switch checked={settings.pomodoroAutoHide} onCheckedChange={(b)=>settings.set({ pomodoroAutoHide: b })} />
								</div>
								</CardContent>
							</Card>

							<Card id="nav-defaults" className="border-0 bg-white/80 dark:bg-neutral-900/60 rounded-3xl">
								<CardContent className="p-4 space-y-4">
								<div className="text-sm font-semibold">Navigation & Defaults</div>
								<div className="grid grid-cols-2 gap-3 items-center">
									<label className="text-sm">Default page</label>
									<Select value={settings.defaultRoute} onValueChange={(v)=>settings.set({ defaultRoute: v as DefaultRoute })}>
										<SelectTrigger className="h-8"><SelectValue placeholder="Route"/></SelectTrigger>
										<SelectContent>
											{['/','/planner','/tasks','/schedule','/course-planner','/scholarships','/textbooks','/settings'].map(r => (
												<SelectItem key={r} value={r}>{r}</SelectItem>
											))}
										</SelectContent>
									</Select>

									<label className="text-sm">Week starts on</label>
									<Select value={String(settings.weekStart)} onValueChange={(v)=>settings.set({ weekStart: Number(v) as 0|1 })}>
										<SelectTrigger className="h-8"><SelectValue/></SelectTrigger>
										<SelectContent>
											<SelectItem value="0">Sunday</SelectItem>
											<SelectItem value="1">Monday</SelectItem>
										</SelectContent>
									</Select>

									<label className="text-sm">Time format</label>
									<Select value={settings.time24h ? '24' : '12'} onValueChange={(v)=>settings.set({ time24h: v==='24' })}>
										<SelectTrigger className="h-8"><SelectValue/></SelectTrigger>
										<SelectContent>
											<SelectItem value="12">12-hour</SelectItem>
											<SelectItem value="24">24-hour</SelectItem>
										</SelectContent>
									</Select>

									<label className="text-sm">Date format</label>
									<Select value={settings.dateFormat} onValueChange={(v: 'auto' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD')=>settings.set({ dateFormat: v })}>
										<SelectTrigger className="h-8"><SelectValue/></SelectTrigger>
										<SelectContent>
											<SelectItem value="auto">Auto</SelectItem>
											<SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
											<SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
											<SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
										</SelectContent>
									</Select>

									<label className="text-sm">Autosave</label>
									<Select value={String(settings.autosaveSeconds)} onValueChange={(v)=>settings.set({ autosaveSeconds: Number(v) as 10|30|60|120 })}>
										<SelectTrigger className="h-8"><SelectValue/></SelectTrigger>
										<SelectContent>
											{[10,30,60,120].map(v => (<SelectItem key={v} value={String(v)}>{v}s</SelectItem>))}
										</SelectContent>
									</Select>

										<label className="text-sm">Currency</label>
										<Select value={settings.preferredCurrency} onValueChange={(v: CurrencyCode)=>settings.set({ preferredCurrency: v })}>
											<SelectTrigger className="h-8"><SelectValue/></SelectTrigger>
											<SelectContent>
												{(['USD','EUR','GBP','CAD','AUD','JPY','INR','CNY','KRW','NGN','ZAR','PHP'] as CurrencyCode[]).map(c => (
													<SelectItem key={c} value={c}>{c}</SelectItem>
												))}
											</SelectContent>
										</Select>

										<label className="text-sm">GPA scale</label>
										<Select value={settings.gpaScale} onValueChange={(v: GPAScale)=>settings.set({ gpaScale: v })}>
											<SelectTrigger className="h-8"><SelectValue/></SelectTrigger>
											<SelectContent>
												<SelectItem value="4-highest">4.00 is highest</SelectItem>
												<SelectItem value="1-highest">1.00 is highest</SelectItem>
											</SelectContent>
										</Select>

									<label className="text-sm">Ask before leaving</label>
									<Switch checked={settings.askBeforeLeave} onCheckedChange={(b)=>settings.set({ askBeforeLeave: b })} />
								</div>
								</CardContent>
							</Card>

							<Card id="notifications" className="border-0 bg-white/80 dark:bg-neutral-900/60 rounded-3xl">
								<CardContent className="p-4 space-y-4">
								<div className="text-sm font-semibold">Notifications & Effects</div>
								<div className="grid grid-cols-2 gap-3 items-center">
									<label className="text-sm">App notifications</label>
									<Switch checked={settings.notificationsEnabled} onCheckedChange={(b)=>settings.set({ notificationsEnabled: b })} />

									<label className="text-sm">Quiet hours</label>
									<div className="flex gap-2">
										<Input className="h-8 w-28" value={settings.quietStart} onChange={(e)=>settings.set({ quietStart: e.target.value })} />
										<Input className="h-8 w-28" value={settings.quietEnd} onChange={(e)=>settings.set({ quietEnd: e.target.value })} />
									</div>

									<label className="text-sm">Confetti</label>
									<Switch checked={settings.confettiEnabled} onCheckedChange={(b)=>settings.set({ confettiEnabled: b })} />

									<label className="text-sm">Sounds</label>
									<Switch checked={settings.soundsEnabled} onCheckedChange={(b)=>settings.set({ soundsEnabled: b })} />
								</div>
								</CardContent>
							</Card>

							<Card id="gamification" className="border-0 bg-white/80 dark:bg-neutral-900/60 rounded-3xl">
								<CardContent className="p-4 space-y-4">
								<div className="text-sm font-semibold flex items-center">
									<Trophy className="mr-2 text-yellow-500" size={16} />
									Gamification System
								</div>
								
								{/* Quick Stats */}
								<div className="grid grid-cols-4 gap-3 text-xs border rounded-lg p-3 bg-muted/30">
									<div className="text-center">
										<div className="text-muted-foreground">Level</div>
										<div className="font-medium">{Math.floor(gamification.stats.totalXp / 500) + 1}</div>
									</div>
									<div className="text-center">
										<div className="text-muted-foreground">XP</div>
										<div className="font-medium">{gamification.stats.totalXp}</div>
									</div>
									<div className="text-center">
										<div className="text-muted-foreground">Badges</div>
										<div className="font-medium">{gamification.stats.badges.length}</div>
									</div>
									<div className="text-center">
										<div className="text-muted-foreground">Streak</div>
										<div className="font-medium">{gamification.stats.streakDays}</div>
									</div>
								</div>

								{/* Settings */}
								<div className="grid grid-cols-2 gap-3 items-center">
									<label className="text-sm">Enable gamification</label>
									<Switch checked={settings.gamificationEnabled} onCheckedChange={(b)=>settings.set({ gamificationEnabled: b })} />

									<label className="text-sm">Show panel</label>
									<Switch checked={gamificationPanelOpen} onCheckedChange={setGamificationPanelOpen} />

									<label className="text-sm">Show streaks</label>
									<Switch checked={settings.showStreaks} onCheckedChange={(b)=>settings.set({ showStreaks: b })} />

									<label className="text-sm">Achievements</label>
									<Switch checked={settings.achievements} onCheckedChange={(b)=>settings.set({ achievements: b })} />
								</div>

								{/* Action Buttons */}
								<div className="space-y-2 pt-2 border-t">
									<Button 
										onClick={resetStreaks} 
										variant="outline" 
										size="sm" 
										className="w-full text-left justify-start"
									>
										<Zap className="mr-2 text-blue-500" size={14} />
										Reset Streaks
									</Button>
									<Button 
										onClick={resetGamificationData} 
										variant="destructive" 
										size="sm" 
										className="w-full text-left justify-start"
									>
										<RotateCcw className="mr-2" size={14} />
										Reset All Progress
									</Button>
								</div>
								</CardContent>
							</Card>

							<Card id="data" className="border-0 bg-white/80 dark:bg-neutral-900/60 rounded-3xl">
								<CardContent className="p-4 space-y-4">
									<div className="text-sm font-semibold flex items-center">
										<Download className="mr-2 text-blue-500" size={16} />
										Data Management
									</div>
									<div className="text-xs text-muted-foreground">Export backs up all your data including settings, theme, academic plan, schedule, tasks, scholarships, textbooks, study sessions, and gamification progress as JSON.</div>
									<div className="flex gap-2">
										<Button variant="outline" size="sm" className="flex-1" onClick={exportData}>
											<Download size={14} className="mr-2" />
											Export
										</Button>
										<Button variant="outline" size="sm" className="flex-1" onClick={importData}>
											<Upload size={14} className="mr-2" />
											Import
										</Button>
										<Button variant="destructive" size="sm" className="flex-1" onClick={clearAllData}>
											<Trash2 size={14} className="mr-2" />
											Clear All
										</Button>
									</div>
								</CardContent>
							</Card>
							</div>
						</div>
					</div>
			</div>
		</div>
	)
}