import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, ArrowLeft, Paperclip, File, X } from 'lucide-react';
import { useSupport } from '@/hooks/useSupport';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const CustomerCare: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { conversations, messages, loading, fetchMessages, createConversation, sendMessage, uploadAttachment } = useSupport();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newConversationSubject, setNewConversationSubject] = useState('');
  const [newConversationMessage, setNewConversationMessage] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    fetchMessages(conversationId);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || (!newMessage.trim() && !selectedFile)) return;
    
    let attachments: any[] = [];

    if (selectedFile) {
      setUploading(true);
      const attachment = await uploadAttachment(selectedConversation, selectedFile);
      if (attachment) {
        attachments.push(attachment);
      }
      setUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }

    await sendMessage(selectedConversation, newMessage, attachments);
    setNewMessage('');
  };

  const handleCreateConversation = async () => {
    if (!newConversationSubject.trim() || !newConversationMessage.trim()) return;
    
    const conversationId = await createConversation(newConversationSubject, newConversationMessage);
    if (conversationId) {
      setShowNewConversation(false);
      setNewConversationSubject('');
      setNewConversationMessage('');
      setSelectedConversation(conversationId);
      fetchMessages(conversationId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Customer Care</h1>
              <p className="text-muted-foreground">Get help and support</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => setShowNewConversation(true)}
                disabled={showNewConversation}
              >
                New
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {showNewConversation && (
                <Card className="border-2 border-primary">
                  <CardContent className="p-4 space-y-3">
                    <Input
                      placeholder="Subject"
                      value={newConversationSubject}
                      onChange={(e) => setNewConversationSubject(e.target.value)}
                    />
                    <Textarea
                      placeholder="Your message..."
                      rows={3}
                      value={newConversationMessage}
                      onChange={(e) => setNewConversationMessage(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleCreateConversation}>
                        Create
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setShowNewConversation(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {conversations.map((conversation) => (
                <Card 
                  key={conversation.id}
                  className={`cursor-pointer transition-colors ${
                    selectedConversation === conversation.id 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <CardContent className="p-4">
                    <div className="font-medium text-sm">{conversation.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(conversation.updated_at).toLocaleDateString()}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block mt-2 ${
                      conversation.status === 'open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {conversation.status}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {conversations.length === 0 && !showNewConversation && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Click "New" to start a conversation</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader>
                  <CardTitle>Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  {/* Messages */}
                  <div className="flex-1 space-y-4 overflow-y-auto mb-4 max-h-96">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.body}</p>
                          
                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment: any, idx: number) => (
                                <div key={idx}>
                                  {attachment.type?.startsWith('image/') ? (
                                    <img 
                                      src={attachment.url} 
                                      alt={attachment.name} 
                                      className="max-w-sm rounded border"
                                    />
                                  ) : (
                                    <a 
                                      href={attachment.url} 
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-sm underline hover:opacity-80"
                                    >
                                      <File className="h-4 w-4" />
                                      {attachment.name} ({Math.round(attachment.size / 1024)}KB)
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Selected File Preview */}
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-lg mb-2">
                      <File className="h-4 w-4" />
                      <span className="text-sm flex-1">{selectedFile.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileSelect}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !uploading && handleSendMessage()}
                      className="flex-1"
                      disabled={uploading}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={(!newMessage.trim() && !selectedFile) || uploading}
                    >
                      {uploading ? '...' : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p>Choose a conversation from the left to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};