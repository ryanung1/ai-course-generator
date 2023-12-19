import CreateCourseForm from '@/components/CreateCourseForm'
import { getAuthSession } from '@/lib/auth'
import { InfoIcon } from 'lucide-react'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {}

const CreatePage = async (props: Props) => {
    const session = await getAuthSession()
    if(!session?.user) {
        return redirect('/gallery')
    }
  return (
    <div className='flex flex-col items-start max-w-xl px-8 mx-auto my-18 sm:px-0'>
        <h1 className='self-center text-3xl font-bold text-center sm:text-4xl mt-8'>AI Course Generation</h1>
        <div className='flex justify-start items-start p-4 mt-5 border-none bg-secondary'>
            <InfoIcon className='w-20 h-8 mr-4 text-blue-400'/>
            <div>
                Enter in a course title or subject area that you would like to learn about. Then, enter a list of units or chapters, which outline more specific topics within your chosen area and our AI will help you to generate a course especially for you!
            </div>
        </div>
        <CreateCourseForm />
    </div>
  )
}

export default CreatePage