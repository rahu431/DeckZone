import React from 'react';
import { MessageSquare, Mic, Target, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SentenceCorrector from '@/components/features/SentenceCorrector';

const HomePage: React.FC = () => {
  // Mock user ID for development
  const userId = 'dev-user-123';

  const features = [
    {
      icon: MessageSquare,
      title: 'Sentence Correction',
      description: 'Get real-time corrections for your English sentences',
      color: 'text-blue-500',
    },
    {
      icon: Mic,
      title: 'Voice Practice',
      description: 'Practice pronunciation with AI feedback',
      color: 'text-green-500',
    },
    {
      icon: Target,
      title: 'Tone Adjustment',
      description: 'Perfect your communication style',
      color: 'text-purple-500',
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Monitor your improvement over time',
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI English Coach
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Improve your English communication confidence with AI-powered corrections,
            voice practice, and personalized feedback.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/voice">
              <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg">
                <Mic className="w-5 h-5 mr-2" />
                Voice-Only Mode
              </Button>
            </Link>
            <Button variant="outline" className="px-8 py-3 text-lg">
              <MessageSquare className="w-5 h-5 mr-2" />
              Text Mode
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <feature.icon className={`w-12 h-12 mx-auto mb-4 ${feature.color}`} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Start Improving Your English
              </h2>
              <p className="text-gray-600">
                Enter a sentence below to get instant corrections and suggestions
              </p>
            </div>

            <SentenceCorrector
              userId={userId}
              onCorrectionComplete={(correction) => {
                console.log('Correction completed:', correction);
              }}
            />
          </Card>
        </div>

        <div className="mt-16 text-center">
          <Card className="bg-primary-50 border-primary-200">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-primary-700 mb-4">
                Choose Your Communication Style
              </h3>
              <p className="text-primary-600 mb-6">
                Select a communication profile that matches your needs and personality
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="p-6 h-auto flex-col space-y-2">
                  <div className="text-2xl">🧭</div>
                  <div className="font-semibold">GPS Mode</div>
                  <div className="text-sm text-gray-600">Direct, efficient communication</div>
                </Button>
                
                <Button variant="outline" className="p-6 h-auto flex-col space-y-2">
                  <div className="text-2xl">☕</div>
                  <div className="font-semibold">Barista Mode</div>
                  <div className="text-sm text-gray-600">Warm, friendly interaction</div>
                </Button>
                
                <Button variant="outline" className="p-6 h-auto flex-col space-y-2">
                  <div className="text-2xl">💃</div>
                  <div className="font-semibold">Dance Mode</div>
                  <div className="text-sm text-gray-600">Expressive, dynamic style</div>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;