from django.urls import path
from .views import OrderView, GameInOrderView, BundleInOrderView, GamesBoughtViewSet

urlpatterns = [    
    path('orders/', OrderView.as_view({'get': 'retrieve_last_order'}), name='retrieve_order'),
    path('orders/add-game/', OrderView.as_view({'post': 'add_game'}), name='add_game'),
    path('orders/add-bundle/', OrderView.as_view({'post': 'add_bundle'}), name='add_bundle'),
    path('orders/<int:pk>/', OrderView.as_view({'post': 'complete_order'}), name="complete_order"),
    path('orders/game/<int:pk>/', GameInOrderView.as_view({'delete': 'destroy'}), name="delete_orders_game"),
    path('orders/bundle/<int:pk>/', BundleInOrderView.as_view({'delete': 'destroy'}), name="delete_orders_bundle"),

    path('library/<int:pk>/add-play-time/', GamesBoughtViewSet.as_view({'post': 'update'}))
]