"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function ChatPage() {
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const tenantId = "st-xaviers"
      const userId = "user-1" // In production, get from auth

      const res = await fetch(`/api/chat?tenantId=${tenantId}&userId=${userId}&type=conversations`)
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const tenantId = "st-xaviers"
      const res = await fetch(`/api/chat?tenantId=${tenantId}&type=messages&conversationId=${conversationId}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const tenantId = "st-xaviers"
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          action: "sendMessage",
          conversationId: selectedConversation.id,
          senderId: "user-1",
          content: newMessage,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setNewMessage("")
        loadMessages(selectedConversation.id)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const selectConversation = (conversation: any) => {
    setSelectedConversation(conversation)
    loadMessages(conversation.id)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-4 p-4">
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <CardDescription>Your recent chats</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {conversations.map((conv: any) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`p-3 rounded-lg cursor-pointer hover:bg-muted ${
                  selectedConversation?.id === conv.id ? "bg-muted" : ""
                }`}
              >
                <div className="font-medium">{conv.name || "New Conversation"}</div>
                <div className="text-sm text-muted-foreground truncate">
                  {conv.participants?.map((p: any) => p.user?.name).join(", ") || "No participants"}
                </div>
                {conv.unreadCount > 0 && (
                  <Badge className="mt-1" variant="destructive">
                    {conv.unreadCount} unread
                  </Badge>
                )}
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No conversations yet
              </div>
            )}
          </div>
          <Button className="mt-4 w-full">New Conversation</Button>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>
            {selectedConversation?.name || "Select a conversation"}
          </CardTitle>
          <CardDescription>
            {selectedConversation?.participants?.map((p: any) => p.user?.name).join(", ") || ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 mb-4 p-4 border rounded-lg overflow-y-auto max-h-[calc(100vh-20rem)]">
            <div className="space-y-4">
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === "user-1" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.senderId === "user-1"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div>{msg.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No messages yet
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              disabled={!selectedConversation}
            />
            <Button onClick={sendMessage} disabled={!selectedConversation}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
