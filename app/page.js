// app/page.js
'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Target,
  Clock,
  Heart
} from 'lucide-react'
import { motion, useScroll } from "motion/react"

const Page = () => {
  const stats = [
    { icon: Users, value: '5000+', label: 'Students Enrolled' },
    { icon: Award, value: '95%', label: 'Success Rate' },
    { icon: BookOpen, value: '50+', label: 'Courses Offered' },
    { icon: TrendingUp, value: '15+', label: 'Years Experience' },
  ]

  const features = [
    {
      icon: Target,
      title: 'Goal-Oriented Learning',
      description: 'Structured curriculum designed to help students achieve their academic goals efficiently.'
    },
    {
      icon: Users,
      title: 'Expert Faculty',
      description: 'Learn from experienced teachers with proven track records in their respective subjects.'
    },
    {
      icon: BookOpen,
      title: 'Comprehensive Materials',
      description: 'Access to well-researched study materials, notes, and practice tests for all subjects.'
    },
    {
      icon: Award,
      title: 'Proven Results',
      description: 'Consistent track record of helping students excel in competitive exams and academics.'
    },
    {
      icon: Clock,
      title: 'Flexible Schedule',
      description: 'Multiple batch timings and flexible learning options to suit every student\'s needs.'
    },
    {
      icon: Heart,
      title: 'Personal Attention',
      description: 'Small batch sizes ensure every student receives individual attention and support.'
    }
  ]

  const galleryImages = [
    {
      src: '',
      alt: 'Modern Classroom',
      title: 'Modern Classrooms'
    },
    {
      src: '',
      alt: 'Interactive Learning',
      title: 'Interactive Learning'
    },
    {
      src: '',
      alt: 'Study Environment',
      title: 'Focused Study Environment'
    },
    {
      src: '',
      alt: 'Group Discussion',
      title: 'Group Discussions'
    },
    {
      src: '',
      alt: 'Library Facility',
      title: 'Well-Equipped Library'
    },
    {
      src: '',
      alt: 'Laboratory',
      title: 'Science Laboratory'
    }
  ]

  const { scrollYProgress } = useScroll()

  return (
    <main className='mt-0 pt-0'>
      <motion.div
        id="scroll-indicator"
        style={{
          scaleX: scrollYProgress,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 10,
          originX: 0,
          backgroundColor: "blue",
        }}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Shape Your Future with
              <span className="text-blue-600 block">SM Academy</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join thousands of successful students who have achieved their dreams with our expert guidance,
              comprehensive study materials, and proven teaching methodologies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl">
                Start Your Journey
              </Link>
              <Link href="/notes" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-200">
                Explore Notes
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SM Academy?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              With over 15 years of experience in education, we have helped thousands of students
              achieve their academic goals through our proven teaching methods and comprehensive support system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow duration-200 group">
                <feature.icon className="h-10 w-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Our Mission
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  To provide quality education that empowers students with knowledge, skills, and confidence
                  to excel in their academic pursuits and build successful careers.
                </p>
                <div className="space-y-3">
                  {[
                    'Quality education for all students',
                    'Innovative teaching methodologies',
                    'Continuous support and guidance'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
                <div className="text-gray-600 mb-4">Years of Excellence</div>
                <div className="text-2xl font-bold text-green-600 mb-2">95%</div>
                <div className="text-gray-600 mb-4">Success Rate</div>
                <div className="text-2xl font-bold text-purple-600 mb-2">5000+</div>
                <div className="text-gray-600">Happy Students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Learning Environment
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Take a glimpse into our state-of-the-art facilities designed to provide
              the perfect learning environment for our students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div key={index} className="relative group overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-semibold">{image.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Experience Excellence?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Visit our campus and see why thousands of students choose SM Academy
              for their academic journey. Schedule a campus tour today!
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Schedule Campus Tour
            </button>
          </div>
        </div>
      </section>

    </main>
  )
}

export default Page
