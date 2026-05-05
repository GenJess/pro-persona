import { Link, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, FileText, Mic, Link2, MessageSquare, UserPlus, Sparkles } from "lucide-react";
import { getPersonBySlug, avatarUrl, feedPosts } from "@/data/communityData";

const Profile = () => {
  const { slug } = useParams<{ slug: string }>();
  const person = slug ? getPersonBySlug(slug) : undefined;

  if (!person) {
    return (
      <div className="max-w-2xl mx-auto px-4 text-center py-20">
        <h1 className="text-2xl font-semibold mb-2">Profile not found</h1>
        <p className="text-muted-foreground mb-6">This professional isn't on the platform yet.</p>
        <Button asChild><Link to="/feed">Back to feed</Link></Button>
      </div>
    );
  }

  const posts = feedPosts.filter((p) => p.authorSlug === person.slug);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <Link to="/feed" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to feed
      </Link>

      {/* Header card */}
      <Card className="border-border/50 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
        <CardContent className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-12">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 ring-4 ring-card shadow-lg">
                <AvatarImage src={avatarUrl(person)} alt={`${person.firstName} ${person.lastName}`} />
                <AvatarFallback className="text-2xl">{person.firstName[0]}{person.lastName[0]}</AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  {person.firstName} {person.lastName}
                </h1>
                <p className="text-muted-foreground">{person.headline}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> {person.location}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-10">
                <UserPlus className="h-4 w-4 mr-1.5" /> Follow
              </Button>
              <Button className="h-10 shadow-md shadow-primary/20">
                <MessageSquare className="h-4 w-4 mr-1.5" /> Talk to Agent
              </Button>
            </div>
          </div>

          {/* Training badges */}
          <div className="flex flex-wrap gap-2 mt-5">
            {person.training.resume && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                <FileText className="h-3 w-3" /> Resume
              </span>
            )}
            {person.training.voice && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                <Mic className="h-3 w-3" /> Voice cloned
              </span>
            )}
            {person.training.projects > 0 && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                <Link2 className="h-3 w-3" /> {person.training.projects} Projects
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-2"><h2 className="font-semibold">About</h2></CardHeader>
            <CardContent><p className="text-sm leading-relaxed text-muted-foreground">{person.about}</p></CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2"><h2 className="font-semibold">Experience</h2></CardHeader>
            <CardContent className="space-y-4">
              {person.experience.map((e, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1 rounded-full bg-primary/30 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{e.role}</p>
                    <p className="text-sm text-muted-foreground">{e.company}</p>
                    <p className="text-xs text-muted-foreground">{e.period}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2"><h2 className="font-semibold">Featured Projects</h2></CardHeader>
            <CardContent className="space-y-3">
              {person.projects.map((p, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/40 border border-border/30">
                  <p className="font-medium text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {posts.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-2"><h2 className="font-semibold">Recent posts</h2></CardHeader>
              <CardContent className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="p-3 rounded-lg border border-border/40">
                    <p className="text-sm leading-relaxed">{post.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{post.timeAgo} · {post.reactions} reactions</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-5 text-center">
              <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Skip the small talk</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Ask {person.firstName}'s agent anything — about projects, philosophy, or career advice.
              </p>
              <Button className="w-full h-10">
                <MessageSquare className="h-4 w-4 mr-1.5" /> Start conversation
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2"><h3 className="font-semibold text-sm">Skills & Topics</h3></CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {person.tags.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-primary/5 text-primary font-medium">{t}</span>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
