
export interface StreamProps {
    isActive: boolean;
    onToggle: () => void;
  }
  
  export interface StreamState {
    isStreaming: boolean;
    error: string | null;
  }

export interface NavigationResponse {
  current_location: string
  target_task: string
  plan: {
    step_number: number
    action: string
    description: string
  }[]
  current_action: string
}