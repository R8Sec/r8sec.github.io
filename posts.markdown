# Posts

{% for post in site.posts %}
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
