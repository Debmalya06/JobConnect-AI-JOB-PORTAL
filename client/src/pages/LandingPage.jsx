import { Link } from "react-router-dom"
import { ArrowRight, Briefcase, Building2, CheckCircle, Search, Users, Zap, Shield, Globe } from "lucide-react"
import Button from "../components/ui/Button"
import { motion } from "framer-motion"

function LandingPage() {
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const zoomVariant = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white overflow-x-hidden">
      {/* Navbar with gradient background */}
      <nav className="bg-gradient-to-r from-purple-600 to-blue-600 text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Briefcase className="h-6 w-6" />
            <span>JobConnect</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth/login">
              <button className="px-4 py-2 rounded-md font-medium transition-colors bg-transparent text-white hover:bg-white hover:text-purple-600">
                Login
              </button>
            </Link>
            <Link to="/auth/register">
              <button className="px-4 py-2 rounded-md font-medium transition-colors bg-white text-purple-600 hover:bg-purple-700 hover:text-white shadow-sm">
                Register
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section (White Background, Left Text, Right Image) */}
      <header className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12">
          
          {/* Left Content */}
          <motion.div 
            className="flex-1 space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
              <Zap className="h-4 w-4" /> AI-Powered Job Matching
            </motion.div>
            
            <motion.h1 variants={fadeUpVariant} className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Dream Job</span> Today
            </motion.h1>
            
            <motion.p variants={fadeUpVariant} className="max-w-2xl text-lg text-gray-600 leading-relaxed">
              Connect with top companies and discover opportunities that perfectly match your skills and career aspirations. AI-driven shortlisting makes hiring faster and fairer.
            </motion.p>
            
            <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/auth/register?type=candidate">
                <Button size="lg" className="w-full sm:w-auto bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200">
                  Join as Candidate <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth/register?type=company">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-purple-200 text-purple-700 hover:bg-purple-50">
                  Join as Company
                </Button>
              </Link>
            </motion.div>
            
            <motion.div variants={fadeUpVariant} className="flex items-center gap-4 text-sm text-gray-500 pt-6">
              <div className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500"/> Free for candidates</div>
              <div className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500"/> AI resume scoring</div>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div 
            className="flex-1 relative"
            initial="hidden"
            animate="visible"
            variants={zoomVariant}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-100 to-blue-50 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
            <img 
              src="/images/hero-img.png" 
              alt="Job Search Illustration" 
              className="w-full h-auto object-contain drop-shadow-2xl rounded-2xl"
              loading="lazy"
            />
          </motion.div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-10">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { label: "Active Jobs", value: "10,000+" },
              { label: "Companies", value: "2,500+" },
              { label: "Candidates", value: "50,000+" },
              { label: "Success Rate", value: "94%" },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="space-y-2">
                <h4 className="text-4xl font-bold text-gray-900">{stat.value}</h4>
                <p className="text-gray-500 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
          >
            <h2 className="text-purple-600 font-semibold tracking-wide uppercase text-sm mb-3">Core Features</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose JobConnect?</h3>
            <p className="text-gray-600 text-lg">We bridge the gap between incredible talent and forward-thinking companies using next-generation AI tools.</p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[
              { icon: Search, title: "Smart Job Matching", desc: "Our AI analyzes your profile to suggest the most relevant roles instantly." },
              { icon: Shield, title: "Verified Companies", desc: "Every company on our platform is verified to ensure a safe job search." },
              { icon: Globe, title: "Global Reach", desc: "Find remote, hybrid, or on-site opportunities anywhere in the world." }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                variants={fadeUpVariant}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="h-14 w-14 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Your journey to a new career or your next great hire is just three steps away.</p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              { step: "01", title: "Create Profile", desc: "Sign up and build a comprehensive profile highlighting your unique skills." },
              { step: "02", title: "AI Analysis", desc: "Our Gemini AI evaluates your resume against thousands of job listings." },
              { step: "03", title: "Get Hired", desc: "Connect directly with recruiters, ace your interviews, and land the job." }
            ].map((item, i) => (
              <motion.div key={i} variants={zoomVariant} className="text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-purple-500/25 border-4 border-gray-800">
                  {item.step}
                </div>
                <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <motion.div 
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl overflow-hidden relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Supercharge Your Career?</h2>
              <p className="text-purple-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                Join thousands of professionals and top-tier companies already using JobConnect to transform their hiring process.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/auth/register">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl">
                    Get Started Now
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 pt-16 pb-8 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 text-xl font-bold text-purple-600 mb-6">
                <Briefcase className="h-6 w-6" />
                <span>JobConnect</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Empowering careers through intelligent connections. We use advanced AI to match the right talent with the right opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Candidates</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link to="/auth/register?type=candidate" className="hover:text-purple-600 transition-colors">Create Account</Link></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Browse Jobs</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Career Advice</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Employers</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link to="/auth/register?type=company" className="hover:text-purple-600 transition-colors">Company Registration</Link></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Post a Job</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-purple-600 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} JobConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
