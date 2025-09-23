import { createClient } from "@/utils/supabase/server";
import { createClient as createClientClient } from "@/utils/supabase/client";

export interface SwipeLimitStatus {
  remainingSwipes: number;
  dailyLimit: number;
  canSwipe: boolean;
}

export interface SwipeResult {
  canSwipe: boolean;
  remainingSwipes: number;
  dailyLimit: number;
}

export class SwipeService {
  /**
   * Get user's current swipe limit status (server-side)
   */
  static async getSwipeLimitStatus(userId: string): Promise<SwipeLimitStatus> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('swipe_credits, last_active')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching swipe status:', error);
      return { remainingSwipes: 0, dailyLimit: 10, canSwipe: false };
    }

    // Check if it's a new day
    const today = new Date().toISOString().split('T')[0];
    const lastActiveDate = data.last_active ? new Date(data.last_active).toISOString().split('T')[0] : null;
    
    if (lastActiveDate !== today) {
      // Reset credits for new day
      await supabase
        .from('users')
        .update({ 
          swipe_credits: 10, 
          last_active: new Date().toISOString() 
        })
        .eq('id', userId);
      
      return { remainingSwipes: 10, dailyLimit: 10, canSwipe: true };
    }

    const remainingSwipes = Math.max(0, data.swipe_credits || 0);
    return {
      remainingSwipes,
      dailyLimit: 10,
      canSwipe: remainingSwipes > 0
    };
  }

  /**
   * Get user's current swipe limit status (client-side)
   */
  static async getSwipeLimitStatusClient(userId: string): Promise<SwipeLimitStatus> {
    const supabase = createClientClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('swipe_credits, last_active')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching swipe status:', error);
      return { remainingSwipes: 0, dailyLimit: 10, canSwipe: false };
    }

    // Check if it's a new day
    const today = new Date().toISOString().split('T')[0];
    const lastActiveDate = data.last_active ? new Date(data.last_active).toISOString().split('T')[0] : null;
    
    if (lastActiveDate !== today) {
      // Reset credits for new day
      await supabase
        .from('users')
        .update({ 
          swipe_credits: 10, 
          last_active: new Date().toISOString() 
        })
        .eq('id', userId);
      
      return { remainingSwipes: 10, dailyLimit: 10, canSwipe: true };
    }

    const remainingSwipes = Math.max(0, data.swipe_credits || 0);
    return {
      remainingSwipes,
      dailyLimit: 10,
      canSwipe: remainingSwipes > 0
    };
  }

  /**
   * Use a swipe credit and check if allowed (server-side)
   */
  static async consumeSwipeCreditServer(userId: string): Promise<SwipeResult> {
    const supabase = await createClient();
    
    // First, get current status
    const status = await this.getSwipeLimitStatus(userId);
    
    if (!status.canSwipe) {
      return {
        canSwipe: false,
        remainingSwipes: status.remainingSwipes,
        dailyLimit: status.dailyLimit
      };
    }

    // Decrement the credit
    const { error } = await supabase
      .from('users')
      .update({ 
        swipe_credits: status.remainingSwipes - 1,
        last_active: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error using swipe credit:', error);
      return {
        canSwipe: false,
        remainingSwipes: status.remainingSwipes,
        dailyLimit: status.dailyLimit
      };
    }

    return {
      canSwipe: true,
      remainingSwipes: status.remainingSwipes - 1,
      dailyLimit: status.dailyLimit
    };
  }

  /**
   * Use a swipe credit and check if allowed (client-side)
   */
  static async consumeSwipeCredit(userId: string): Promise<SwipeResult> {
    const supabase = createClientClient();
    
    // First, get current status
    const status = await this.getSwipeLimitStatusClient(userId);
    
    if (!status.canSwipe) {
      return {
        canSwipe: false,
        remainingSwipes: status.remainingSwipes,
        dailyLimit: status.dailyLimit
      };
    }

    // Decrement the credit
    const { error } = await supabase
      .from('users')
      .update({ 
        swipe_credits: status.remainingSwipes - 1,
        last_active: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error using swipe credit:', error);
      return {
        canSwipe: false,
        remainingSwipes: status.remainingSwipes,
        dailyLimit: status.dailyLimit
      };
    }

    return {
      canSwipe: true,
      remainingSwipes: status.remainingSwipes - 1,
      dailyLimit: status.dailyLimit
    };
  }

  /**
   * Record a swipe action in the swipes table
   */
  static async recordSwipe(
    swiperId: string,
    jobPostId: string,
    action: 'apply' | 'skip'
  ): Promise<boolean> {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('swipes')
      .insert({
        swiper_id: swiperId,
        job_post_id: jobPostId,
        action: action === 'apply' ? 'apply' : 'skip'
      });
      
    if (error) {
      console.error('Error recording swipe:', error);
      return false;
    }
    
    return true;
  }

  /**
   * Record a swipe action in the swipes table (client-side)
   */
  static async recordSwipeClient(
    swiperId: string,
    jobPostId: string,
    action: 'apply' | 'skip'
  ): Promise<boolean> {
    const supabase = createClientClient();
    
    const { error } = await supabase
      .from('swipes')
      .insert({
        swiper_id: swiperId,
        job_post_id: jobPostId,
        action: action === 'apply' ? 'apply' : 'skip'
      });
      
    if (error) {
      console.error('Error recording swipe:', error);
      return false;
    }
    
    return true;
  }
}
