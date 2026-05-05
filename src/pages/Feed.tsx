import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Users, Sparkles, TrendingUp, Hash } from "lucide-react";
import { communityPeople, feedPosts, groups, interests, avatarUrl, getPersonBySlug } from "@/data/communityData";
import { useAuth } from "@/contexts/AuthProvider";
import { useEffect } from "react";

const Feed = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate("/signin");
  }, [session, loading, navigate]);

  if (!session) return null;

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left rail — Profile + interests */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4">
          <Card className="border-border/50 overflow-hidden">
            <div className="h-16 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
            <CardContent className="-mt-8 pb-5">
              <Avatar className="h-16 w-16 ring-4 ring-card mb-3">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">You</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">Your Agent</h3>
              <p className="text-xs text-muted-foreground mb-3">Make sure your profile is sharp.</p>
              <Button asChild size="sm" variant="outline" className="w-full h-9">
                <Link to="/account">Manage Agent</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" /> Your Interests
              </h3>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {interests.slice(0, 8).map((i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors">
                  {i}
                </span>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Center — Feed */}
        <main className="lg:col-span-6 space-y-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">You</AvatarFallback>
              </Avatar>
              <button className="flex-1 text-left px-4 py-2.5 rounded-full border border-border bg-muted/30 text-sm text-muted-foreground hover:bg-muted transition-colors">
                Share an update or insight…
              </button>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="font-medium">Trending in your network</span>
          </div>

          {feedPosts.map((post) => {
            const author = getPersonBySlug(post.authorSlug);
            if (!author) return null;
            return (
              <Card key={post.id} className="border-border/50 hover:border-primary/20 transition-colors">
                <CardHeader className="pb-3">
                  <Link to={`/p/${author.slug}`} className="flex items-center gap-3 group">
                    <Avatar className="h-11 w-11 ring-2 ring-border group-hover:ring-primary/40 transition">
                      <AvatarImage src={avatarUrl(author)} alt={`${author.firstName} ${author.lastName}`} />
                      <AvatarFallback>{author.firstName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {author.firstName} {author.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{author.headline}</p>
                      <p className="text-xs text-muted-foreground">{post.timeAgo} · 🌐</p>
                    </div>
                  </Link>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <p className="text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
                </CardContent>
                <CardFooter className="border-t border-border/50 py-2 px-2 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="px-2">{post.reactions} reactions · {post.comments} comments</div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground">
                      <Heart className="h-4 w-4" /> Like
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" /> Comment
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="h-9 gap-1.5 text-primary">
                      <Link to={`/p/${author.slug}`}>
                        <Sparkles className="h-4 w-4" /> Ask Agent
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </main>

        {/* Right rail — People & Groups */}
        <aside className="lg:col-span-3 space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> People to know
              </h3>
              <Link to="/personas" className="text-xs text-primary hover:underline">See all</Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {communityPeople.slice(0, 4).map((p) => (
                <Link key={p.slug} to={`/p/${p.slug}`} className="flex items-center gap-3 group">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarUrl(p)} alt={p.firstName} />
                    <AvatarFallback>{p.firstName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.headline}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" /> Groups
              </h3>
              <Link to="/groups" className="text-xs text-primary hover:underline">See all</Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {groups.slice(0, 4).map((g) => (
                <Link key={g.id} to="/groups" className="block p-2 -mx-2 rounded-lg hover:bg-muted transition-colors">
                  <p className="text-sm font-medium">{g.name}</p>
                  <p className="text-xs text-muted-foreground">{g.members.toLocaleString()} members</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default Feed;
