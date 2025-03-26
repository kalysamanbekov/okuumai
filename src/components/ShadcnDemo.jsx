import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Toast, ToastAction, ToastClose, ToastTitle, ToastDescription } from './ui/toast';
import ShadcnAuthForm from './ShadcnAuthForm';
import ShadcnChat from './ShadcnChat';
import { cn } from '../lib/utils';

const ShadcnDemo = () => {
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState('auth');
  
  const handleShowToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Shadcn/UI u0414u0435u043cu043eu043du0441u0442u0440u0430u0446u0438u044f</h1>
        <p className="text-muted-foreground">u041fu0440u0438u043cu0435u0440u044b u043au043eu043cu043fu043eu043du0435u043du0442u043eu0432 u0438 u0438u0445 u0438u0441u043fu043eu043bu044cu0437u043eu0432u0430u043du0438u044f u0432 OKUUM.AI</p>
      </div>
      
      {/* u041du0430u0432u0438u0433u0430u0446u0438u044f u043fu043e u0432u043au043bu0430u0434u043au0430u043c */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <button
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              activeTab === 'auth' 
                ? "bg-background shadow-sm" 
                : "hover:bg-background/50 text-muted-foreground"
            )}
            onClick={() => setActiveTab('auth')}
          >
            u0410u0443u0442u0435u043du0442u0438u0444u0438u043au0430u0446u0438u044f
          </button>
          <button
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              activeTab === 'chat' 
                ? "bg-background shadow-sm" 
                : "hover:bg-background/50 text-muted-foreground"
            )}
            onClick={() => setActiveTab('chat')}
          >
            u0427u0430u0442
          </button>
          <button
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              activeTab === 'components' 
                ? "bg-background shadow-sm" 
                : "hover:bg-background/50 text-muted-foreground"
            )}
            onClick={() => setActiveTab('components')}
          >
            u041au043eu043cu043fu043eu043du0435u043du0442u044b
          </button>
        </div>
      </div>
      
      {/* u0421u043eu0434u0435u0440u0436u0438u043cu043eu0435 u0432u043au043bu0430u0434u043eu043a */}
      <div className="max-w-4xl mx-auto">
        {activeTab === 'auth' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-4">u0424u043eu0440u043cu0430 u0430u0443u0442u0435u043du0442u0438u0444u0438u043au0430u0446u0438u0438</h2>
            <ShadcnAuthForm onAuthSuccess={(user) => console.log('Auth success:', user)} />
          </div>
        )}
        
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-4">u0427u0430u0442 u0438u043du0442u0435u0440u0444u0435u0439u0441</h2>
            <ShadcnChat />
          </div>
        )}
        
        {activeTab === 'components' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center mb-4">u0411u0430u0437u043eu0432u044bu0435 u043au043eu043cu043fu043eu043du0435u043du0442u044b</h2>
            
            {/* u041au043du043eu043fu043au0438 */}
            <Card>
              <CardHeader>
                <CardTitle>u041au043du043eu043fu043au0438</CardTitle>
                <CardDescription>u0420u0430u0437u043bu0438u0447u043du044bu0435 u0432u0430u0440u0438u0430u043du0442u044b u043au043du043eu043fu043eu043a u0438 u0438u0445 u0440u0430u0437u043cu0435u0440u044b</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  <Button size="lg">Large</Button>
                  <Button>Default</Button>
                  <Button size="sm">Small</Button>
                  <Button size="xs">Extra Small</Button>
                </div>
              </CardContent>
            </Card>
            
            {/* u041fu043eu043bu044f u0432u0432u043eu0434u0430 */}
            <Card>
              <CardHeader>
                <CardTitle>u041fu043eu043bu044f u0432u0432u043eu0434u0430</CardTitle>
                <CardDescription>u0420u0430u0437u043bu0438u0447u043du044bu0435 u0442u0438u043fu044b u043fu043eu043bu0435u0439 u0432u0432u043eu0434u0430</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">u0421u0442u0430u043du0434u0430u0440u0442u043du044bu0439 u0432u0432u043eu0434</label>
                  <Input placeholder="u0412u0432u0435u0434u0438u0442u0435 u0442u0435u043au0441u0442..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">u0412u0432u043eu0434 u0441 u0438u043au043eu043du043au043eu0439</label>
                  <div className="relative">
                    <Input placeholder="u041fu043eu0438u0441u043a..." />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">u041eu0442u043au043bu044eu0447u0435u043du043du044bu0439 u0432u0432u043eu0434</label>
                  <Input placeholder="u041du0435u0434u043eu0441u0442u0443u043fu043du043e" disabled />
                </div>
              </CardContent>
            </Card>
            
            {/* u0423u0432u0435u0434u043eu043cu043bu0435u043du0438u044f */}
            <Card>
              <CardHeader>
                <CardTitle>u0423u0432u0435u0434u043eu043cu043bu0435u043du0438u044f</CardTitle>
                <CardDescription>u041fu0440u0438u043cu0435u0440u044b u0443u0432u0435u0434u043eu043cu043bu0435u043du0438u0439 u0438 u0442u043eu0441u0442u043eu0432</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleShowToast}>u041fu043eu043au0430u0437u0430u0442u044c u0443u0432u0435u0434u043eu043cu043bu0435u043du0438u0435</Button>
                
                {showToast && (
                  <div className="fixed bottom-4 right-4 max-w-md z-50">
                    <Toast>
                      <div className="flex">
                        <div className="flex-1">
                          <ToastTitle>u0423u0441u043fu0435u0448u043du043e!</ToastTitle>
                          <ToastDescription>u0414u0435u0439u0441u0442u0432u0438u0435 u0431u044bu043bu043e u0443u0441u043fu0435u0448u043du043e u0432u044bu043fu043eu043bu043du0435u043du043e.</ToastDescription>
                        </div>
                        <ToastClose onClick={() => setShowToast(false)} />
                      </div>
                      <ToastAction altText="u041eu0442u043cu0435u043du0438u0442u044c" onClick={() => setShowToast(false)}>u041eu0442u043cu0435u043du0438u0442u044c</ToastAction>
                    </Toast>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">u041du0430u0436u043cu0438u0442u0435 u043du0430 u043au043du043eu043fu043au0443, u0447u0442u043eu0431u044b u0443u0432u0438u0434u0435u0442u044c u0443u0432u0435u0434u043eu043cu043bu0435u043du0438u0435</p>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShadcnDemo;
