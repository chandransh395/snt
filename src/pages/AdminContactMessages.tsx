
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  MessageSquare,
  Search,
  Mail,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Send,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  status: string;
  phone?: string;
}

interface MessageReply {
  id: string;
  message_id: string;
  admin_name: string;
  message: string;
  created_at: string;
}

const AdminContactMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [replies, setReplies] = useState<{ [key: string]: MessageReply[] }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    ensureContactTablesExist();
    fetchMessages();
  }, []);
  
  // Ensure tables exist
  const ensureContactTablesExist = async () => {
    try {
      // Check if contact_messages table exists
      const { error } = await supabase
        .from('contact_messages')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') {
        console.log('Creating contact tables...');
        
        // Create contact_messages table
        const { error: createMessagesError } = await supabase.rpc('create_contact_tables');
        
        if (createMessagesError) {
          console.error('Error creating contact tables:', createMessagesError);
        } else {
          // Add sample data for testing
          await addSampleContactMessages();
        }
      }
    } catch (err) {
      console.error('Error initializing contact tables:', err);
    }
  };
  
  // Add sample contact messages for testing
  const addSampleContactMessages = async () => {
    try {
      const sampleMessages = [
        {
          name: 'John Smith',
          email: 'john@example.com',
          subject: 'Tour Package Inquiry',
          message: 'Hello, I am interested in your European tour packages. Could you please provide more details about the itinerary and pricing for a family of 4? We are planning to travel in August.',
          status: 'new',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          subject: 'Booking Confirmation',
          message: 'I just completed a booking for the Thailand adventure tour but haven\'t received a confirmation email yet. Could you please verify my booking status? My reference number is TH-2023-45678.',
          status: 'replied',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Michael Brown',
          email: 'michael@example.com',
          phone: '+1 555-123-4567',
          subject: 'Special Requirements',
          message: 'I have a booking for the Japan cultural tour next month. I need to inform you about some dietary restrictions. I am vegetarian and my wife has a gluten allergy. Could you please ensure that appropriate meals are arranged during our tour?',
          status: 'new',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      const { error } = await supabase
        .from('contact_messages')
        .insert(sampleMessages);
        
      if (error) {
        console.error('Error adding sample messages:', error);
      } else {
        // Add a sample reply to Sarah's message
        // First get Sarah's message id
        const { data: sarahMessage } = await supabase
          .from('contact_messages')
          .select('id')
          .eq('email', 'sarah@example.com')
          .single();
          
        if (sarahMessage) {
          const { error: replyError } = await supabase
            .from('contact_replies')
            .insert({
              message_id: sarahMessage.id,
              admin_name: 'Admin',
              message: 'Hello Sarah, I have checked your booking and it is confirmed. You should receive the confirmation email shortly. Please let us know if you have any other questions.',
              created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            });
            
          if (replyError) {
            console.error('Error adding sample reply:', replyError);
          }
        }
      }
    } catch (err) {
      console.error('Error adding sample data:', err);
    }
  };
  
  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Fetch actual messages from the database
      const { data: contactData, error: contactError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (contactError) throw contactError;
      
      // Fetch replies
      const { data: repliesData, error: repliesError } = await supabase
        .from('contact_replies')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (repliesError) throw repliesError;
      
      // Group replies by message_id
      const repliesByMessageId: { [key: string]: MessageReply[] } = {};
      if (repliesData) {
        repliesData.forEach((reply: MessageReply) => {
          if (!repliesByMessageId[reply.message_id]) {
            repliesByMessageId[reply.message_id] = [];
          }
          repliesByMessageId[reply.message_id].push(reply);
        });
      }
      
      setMessages(contactData || []);
      setReplies(repliesByMessageId);
      
    } catch (error) {
      console.error("Failed to fetch contact messages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load contact messages"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filter messages based on search term, status filter, and active tab
  const getFilteredMessages = () => {
    return messages.filter(message => {
      // Apply search filter
      const matchesSearch = 
        message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply status filter
      const matchesStatus = statusFilter === "all" || message.status === statusFilter;
      
      // Apply tab filter
      const matchesTab = 
        activeTab === "all" || 
        (activeTab === "replied" && message.status === "replied") || 
        (activeTab === "unreplied" && message.status === "new");
      
      return matchesSearch && matchesStatus && matchesTab;
    });
  };
  
  // Sort messages by date (newest first)
  const sortedMessages = getFilteredMessages().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  const handleReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) return;
    
    setReplying(true);
    try {
      // Get admin info
      const { data: userData } = await supabase.auth.getUser();
      const adminName = userData?.user?.email || "Admin";
      
      // Add reply to the database
      const { data: replyData, error: replyError } = await supabase
        .from('contact_replies')
        .insert({
          message_id: selectedMessage.id,
          admin_name: adminName,
          message: replyMessage,
        })
        .select()
        .single();
        
      if (replyError) throw replyError;
      
      // Update message status to replied
      const { error: updateError } = await supabase
        .from('contact_messages')
        .update({ status: 'replied' })
        .eq('id', selectedMessage.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === selectedMessage.id 
            ? { ...msg, status: "replied" }
            : msg
        )
      );
      
      // Update replies
      setReplies(prev => ({
        ...prev,
        [selectedMessage.id]: [
          ...(prev[selectedMessage.id] || []),
          replyData as MessageReply
        ]
      }));
      
      toast({
        title: "Reply Sent",
        description: `Your reply to ${selectedMessage.name} has been sent.`
      });
      
      setReplyMessage("");
      setReplyOpen(false);
    } catch (error) {
      console.error("Failed to send reply:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send reply. Please try again."
      });
    } finally {
      setReplying(false);
    }
  };
  
  const handleMarkStatus = async (messageId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', messageId);
        
      if (error) throw error;
      
      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId
            ? { ...msg, status: newStatus }
            : msg
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Message marked as ${newStatus}.`
      });
      
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update message status."
      });
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contact Messages</h1>
        <p className="text-muted-foreground">Manage and respond to customer inquiries</p>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-6 w-full md:w-auto flex overflow-x-auto">
          <TabsTrigger value="all" className="flex-1 md:flex-none">All Messages</TabsTrigger>
          <TabsTrigger value="unreplied" className="flex-1 md:flex-none">Unreplied</TabsTrigger>
          <TabsTrigger value="replied" className="flex-1 md:flex-none">Replied</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search messages..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2 sm:w-48">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline"
              onClick={fetchMessages}
              className="sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {renderMessagesList()}
        </TabsContent>
        
        <TabsContent value="unreplied">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search unreplied messages..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button 
              variant="outline"
              onClick={fetchMessages}
              className="sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {renderMessagesList()}
        </TabsContent>
        
        <TabsContent value="replied">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search replied messages..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button 
              variant="outline"
              onClick={fetchMessages}
              className="sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {renderMessagesList()}
        </TabsContent>
      </Tabs>
      
      {/* Reply Dialog */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.name}</DialogTitle>
            <DialogDescription>
              Your reply will be sent via email to {selectedMessage?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted/40 p-3 rounded-md mb-4 max-h-[150px] overflow-y-auto">
            <p className="text-sm whitespace-pre-line">{selectedMessage?.message}</p>
          </div>
          
          <Textarea
            placeholder="Type your reply here..."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            rows={5}
            className="mb-4"
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReply}
              disabled={!replyMessage.trim() || replying}
              className="bg-travel-gold hover:bg-amber-600 text-black"
            >
              {replying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="h-4 w-4 mr-2" />
              {replying ? 'Sending...' : 'Send Reply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
  
  function renderMessagesList() {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-travel-gold" />
        </div>
      );
    } 
    
    if (sortedMessages.length === 0) {
      return (
        <Card className="text-center py-16 bg-muted/30">
          <CardContent>
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No messages found</h2>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" || activeTab !== "all"
                ? "Try adjusting your search or filter criteria." 
                : "There are no contact messages to display."}
            </p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedMessages.map(message => (
          <Card key={message.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{message.subject || "No Subject"}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <User className="h-3.5 w-3.5 mr-1" />
                    {message.name}
                  </CardDescription>
                </div>
                <Badge 
                  className={`${
                    message.status === 'new'
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {message.status === 'new' ? 'New' : 'Replied'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pb-3">
              <div className="flex items-center text-sm mb-2">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <a href={`mailto:${message.email}`} className="text-travel-gold hover:underline">
                  {message.email}
                </a>
              </div>
              
              {message.phone && (
                <div className="flex items-center text-sm mb-2">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{message.phone}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
              </div>
              
              <div className="bg-muted/40 p-3 rounded-md mb-3">
                <p className="text-sm whitespace-pre-line">{message.message}</p>
              </div>
              
              {replies[message.id] && replies[message.id].length > 0 && (
                <div className="mt-4 pt-3 border-t">
                  <p className="text-sm font-medium flex items-center mb-2">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Your Response
                  </p>
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
                    <p className="text-sm whitespace-pre-line">
                      {replies[message.id][replies[message.id].length - 1].message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(
                        new Date(replies[message.id][replies[message.id].length - 1].created_at),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-wrap gap-2">
              <Button
                className="flex-1 bg-travel-gold hover:bg-amber-600 text-black"
                onClick={() => {
                  setSelectedMessage(message);
                  setReplyOpen(true);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {message.status === 'new' ? 'Reply' : 'Send Another Reply'}
              </Button>
              
              {message.status === 'new' ? (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleMarkStatus(message.id, 'replied')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Replied
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleMarkStatus(message.id, 'new')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Mark as Unreplied
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
};

export default AdminContactMessages;
