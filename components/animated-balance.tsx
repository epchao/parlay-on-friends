"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";

interface AnimatedBalanceProps {
  userId: string;
  initialBalance: number;
}

export default function AnimatedBalance({ userId, initialBalance }: AnimatedBalanceProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'increase' | 'decrease' | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Function to fetch current balance
    const fetchCurrentBalance = async () => {
      try {
        const response = await fetch('/api/user/balance');
        if (response.ok) {
          const data = await response.json();
          const currentBalance = data.balance;
          
          // Only animate if the balance actually changed from what we have stored
          if (currentBalance !== balance) {
            if (currentBalance > balance) {
              setAnimationType('increase');
            } else {
              setAnimationType('decrease');
            }
            
            setIsAnimating(true);
            setBalance(currentBalance);
            
            setTimeout(() => {
              setIsAnimating(false);
              setAnimationType(null);
            }, 500);
          }
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    // Fetch balance immediately when component mounts
    fetchCurrentBalance();

    // Also fetch when page becomes visible (user returns from Stripe)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCurrentBalance();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Subscribe to real-time changes in users table
    const subscription = supabase
      .channel('users_balance_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          const newBalance = payload.new.account_balance;
          const oldBalance = balance;
          
          if (newBalance !== oldBalance) {
            // Determine animation type
            if (newBalance > oldBalance) {
              setAnimationType('increase');
            } else {
              setAnimationType('decrease');
            }
            
            setIsAnimating(true);
            setBalance(newBalance);
            
            setTimeout(() => {
              setIsAnimating(false);
              setAnimationType(null);
            }, 500);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, balance, supabase]);

  const getAnimationClasses = () => {
    if (!isAnimating) {
      return "bg-yellow-500/20 border-yellow-500 text-yellow-600 dark:bg-yellow-400/25 dark:border-yellow-400 dark:text-yellow-300";
    }
    
    if (animationType === 'increase') {
      return "bg-green-500/40 border-green-400 text-green-700 shadow-lg shadow-green-500/40 balance-increase dark:bg-green-400/50 dark:border-green-300 dark:text-green-100 dark:shadow-green-400/50";
    } else {
      return "bg-red-500/40 border-red-400 text-red-700 shadow-lg shadow-red-500/40 balance-decrease dark:bg-red-400/50 dark:border-red-300 dark:text-red-100 dark:shadow-red-400/50";
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`
        transition-all duration-500 ease-in-out font-semibold
        ${getAnimationClasses()}
        hover:scale-105
      `}
      disabled
    >
      <span className="text-sm">
        💰 ${balance.toFixed(2)}
      </span>
    </Button>
  );
}
