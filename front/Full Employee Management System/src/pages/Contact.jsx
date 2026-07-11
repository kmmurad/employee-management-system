import { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarker, FaGithub, FaLinkedin, FaTwitter, FaPaperPlane } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent successfully!');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    { icon: FaEnvelope, label: 'Email', value: 'support@employeems.com' },
    { icon: FaPhone, label: 'Phone', value: '+1 (555) 123-4567' },
    { icon: FaMapMarker, label: 'Address', value: '123 Business St, Tech City, TC 12345' },
  ];

  const socialLinks = [
    { icon: FaGithub, label: 'GitHub', color: 'hover:bg-slate-800' },
    { icon: FaLinkedin, label: 'LinkedIn', color: 'hover:bg-blue-700' },
    { icon: FaTwitter, label: 'Twitter', color: 'hover:bg-sky-500' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Contact</h1>
        <p className="text-slate-500 mt-1">Get in touch with us</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <info.icon className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{info.label}</p>
                    <p className="font-medium text-slate-800">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Follow Us">
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <button
                  key={index}
                  className={`w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center transition-all hover:bg-blue-600 hover:text-white`}
                >
                  <social.icon className="text-lg" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card title="Send us a message">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <Input
                label="Subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="How can we help?"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="5"
                  placeholder="Write your message here..."
                />
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button type="submit">
                  <FaPaperPlane className="mr-2" /> Send Message
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}