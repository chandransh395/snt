
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
import { useToast } from "@/components/ui/use-toast";
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

// Mock contact message data
const mockMessages = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    subject: "Booking Inquiry",
    message: "Hi, I'm interested in booking a trip to Bali for my family of 4. Do you have any special packages available for next summer?",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "new",
    replies: []
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    subject: "Cancellation Policy",
    message: "I'd like to know more about your cancellation policy. If I need to cancel my trip due to an emergency, what are my options?",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "replied",
    replies: [
      {
        id: "r1",
        admin_name: "Admin User",
        message: "Hi Sarah, thank you for your inquiry. Our standard cancellation policy allows for full refunds if canceled 30 days before the trip date. For cancellations within 30 days, there's a graduated refund schedule. For emergencies, we do offer trip insurance that can be purchased at the time of booking. Please let me know if you need more specific information.",
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: "3",
    name: "Michael Wong",
    email: "michael.w@example.com",
    subject: "Special dietary requirements",
    message: "Hello, I have some dietary restrictions (gluten-free and dairy-free). Can you accommodate these on your tour packages? I'm particularly interested in the European culinary tour.",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "replied",
    replies: [
      {
        id: "r2",
        admin_name: "Admin User",
        message: "Hi Michael, we absolutely can accommodate your dietary restrictions. All of our tours, including the European Culinary Tour, can be adjusted for various dietary needs. We'll make note of your requirements and ensure that appropriate meals are prepared throughout your journey.",
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

type ContactMessage = typeof mockMessages[0];

const AdminContactMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);
  
  useEffect(() => {
    // In a real application, you would fetch the messages from your backend
    const fetchMessages = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMessages(mockMessages);
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
    
    fetchMessages();
  }, [toast]);
  
  // Filter messages based on search term and status filter
  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort messages by date (newest first)
  const sortedMessages = [...filteredMessages].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  const handleReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) return;
    
    setReplying(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add reply to the message
      const reply = {
        id: `r${Date.now()}`,
        admin_name: "Admin User", // In a real app, use the logged-in admin's name
        message: replyMessage,
        created_at: new Date().toISOString()
      };
      
      // Update the message with the new reply
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === selectedMessage.id 
            ? { 
                ...msg, 
                status: "replied", 
                replies: [...msg.replies, reply] 
              }
            : msg
        )
      );
      
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
  
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contact Messages</h1>
        <p className="text-muted-foreground">Manage and respond to customer inquiries</p>
      </header>
      
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
          onClick={() => {
            setLoading(true);
            // Re-fetch messages (in a real app)
            setTimeout(() => {
              setLoading(false);
            }, 800);
          }}
          className="sm:w-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-travel-gold" />
        </div>
      ) : sortedMessages.length === 0 ? (
        <Card className="text-center py-16 bg-muted/30">
          <CardContent>
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No messages found</h2>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria." 
                : "There are no contact messages to display."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedMessages.map(message => (
            <Card key={message.id} className="animate-fade-in overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{message.subject}</CardTitle>
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
                
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
                </div>
                
                <div className="bg-muted/40 p-3 rounded-md mb-3">
                  <p className="text-sm whitespace-pre-line">{message.message}</p>
                </div>
                
                {message.replies.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <p className="text-sm font-medium flex items-center mb-2">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      Your Response
                    </p>
                    <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
                      <p className="text-sm whitespace-pre-line">{message.replies[message.replies.length - 1].message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(message.replies[message.replies.length - 1].created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter>
                <Button
                  className="w-full bg-travel-gold hover:bg-amber-600 text-black"
                  onClick={() => {
                    setSelectedMessage(message);
                    setReplyOpen(true);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {message.status === 'new' ? 'Reply' : 'Send Another Reply'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
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
};

export default AdminContactMessages;
