"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Loader2 } from "lucide-react"

export default function Todos() {
  const [todos, setTodos] = useState([])
  const [newTask, setNewTask] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.from("todos").select("*").order("created_at", { ascending: false })

        if (error) throw error

        setTodos(data || [])
      } catch (error: any) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTodos()
  }, [supabase])

  const handleAddTask = async () => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.from("todos").insert({ task: newTask })

      if (error) throw error

      setNewTask("")
      // Refresh todos
      const { data } = await supabase.from("todos").select("*").order("created_at", { ascending: false })

      setTodos(data || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (id: number, is_completed: boolean) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.from("todos").update({ is_completed: !is_completed }).eq("id", id)

      if (error) throw error

      // Refresh todos
      const { data } = await supabase.from("todos").select("*").order("created_at", { ascending: false })

      setTodos(data || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex items-center space-x-2">
          <Input type="text" placeholder="Add a task" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
          <Button onClick={handleAddTask} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </>
            )}
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-center justify-between">
              <label htmlFor={`todo-${todo.id}`} className="flex items-center">
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.is_completed}
                  onCheckedChange={() => handleComplete(todo.id, todo.is_completed)}
                />
                <span className="ml-2">{todo.task}</span>
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
