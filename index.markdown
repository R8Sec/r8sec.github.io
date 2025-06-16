# Welcome

Hi! This will be a place for me to share the stuff I learn in my cybersecurity journey.
From walkthroughs to tutorials, I hope you find something useful here.

# Latest uploads

{% for post in site.posts limit:5 %}
<div class="post">
  <p class="date">
    {{ post.date | date: "%d/%m/%y" }}
  </p>

  <h2>{{ post.title }}</h2>

  <p>
    {{ post.excerpt }}
  </p>

  <a href="{{ post.url }}">Read More</a>
</div>
{% endfor %}
