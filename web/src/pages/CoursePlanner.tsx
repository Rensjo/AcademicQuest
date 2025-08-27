import React from 'react'
import { useAQ } from '@/store/aqStore'


export default function CoursePlanner() {
const aq = useAQ()
return (
<div className="max-w-5xl mx-auto px-4 py-8">
<h1 className="text-2xl font-bold">Course Planner</h1>
<p className="text-neutral-600 mt-2">Term: {aq.term}</p>
</div>
)
}